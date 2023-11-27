import { Octokit, RequestError } from "octokit";
import fetch from "node-fetch";
const { graphql } = require("@octokit/graphql");
import { GraphqlResponseError } from "@octokit/graphql";

import fs, { unwatchFile } from "fs";
import http from "isomorphic-git/http/node";
import { clone } from "isomorphic-git";
import path from "path";
import { dirSync } from "tmp";
import { log } from "./logger";

export interface Metric {
	name: string;
	description: string;
	evaluate(): Promise<number>;
}

// This is our class for all metrics.
export abstract class BaseMetric implements Metric {
	// NOTE: Not necessary to implement the interface properties, but I think it's good practice.
	//       Also, initializing a default value. These will get overwritten by the subclass.
	public name: string = "BaseMetric";
	public description: string = "BaseMetricDescription";
	public octokit: Octokit;
	public owner: string;
	public repo: string;

	constructor(owner: string, repo: string) {
		this.owner = owner;
		this.repo = repo;
		// NOTE: I'm not sure, but I think we need an Octokit for each metric
		//       I'll put this here, but feel free to change this.
		this.octokit = new Octokit({ auth: process.env.GITHUB_TOKEN, request: { fetch } });
	}

	abstract evaluate(): Promise<number>;
}

// A subclass of BaseMetric.
export class BusFactor extends BaseMetric {
	name = "BusFactor";
	description = "Measures how many developers are essential for the project.";

	async evaluate(): Promise<number> {
		const rawBusFactorMax = 10; //implicitly set by our formula taking min(rawBusFactor//10, 1)

		try {
			const { repository } = await graphql(
				`
				query {
					repository(owner:"${this.owner}", name:"${this.repo}") {
					defaultBranchRef {
						target {
						... on Commit {
							history {
							totalCount
							}
						}
						}
					}
					}
				}
				`,
				{
					headers: {
						authorization: `token ${process.env.GITHUB_TOKEN}`,
					},
				},
			);
			// https://stackoverflow.com/questions/49442317/github-graphql-repository-query-commits-totalcount
			const halfTotalCommits: number = Math.floor(
				repository.defaultBranchRef.target.history.totalCount / 2,
			);

			const contributors = await this.octokit.rest.repos.listContributors({
				per_page: rawBusFactorMax,
				owner: this.owner,
				repo: this.repo,
			});

			let rawBusFactor: number = 0;
			let topContributorCommitNum: number = 0;
			for (const contributor of contributors.data) {
				rawBusFactor += 1;
				topContributorCommitNum += contributor.contributions;
				if (topContributorCommitNum > halfTotalCommits) {
					break;
				}
			}

			return Math.min(rawBusFactor / rawBusFactorMax, 1);
		} catch (error) {
			// Octokit errors always have a `error.status` property which is the http response code
			if (error instanceof RequestError || error instanceof GraphqlResponseError) {
				console.error("Octokit error evaluating BusFactor: ", error);
			} else {
				// handle all other errors
				console.error("non-Octokit error evaluating BusFactor: ", error);
			}

			return 0;
		}

		// return 0.5; // Just a placeholder. TODO: implement.
	}
}

// A subclass of BaseMetric.
export class Responsiveness extends BaseMetric {
	name = "Responsiveness";
	description = "Measures how quickly the developers react to changes in the module.";

	async getAverageDaysPR(): Promise<number | null> {
		const numCloseTimes = 70; //get the last {numCloseTimes}
		//values greater than 100 have the same effect as 100 (effectively min(val, 100))
		//greater values give a clearer picture but may reach back undesirably far / cause slower runtime
		try {
			// Get the last {numCloseTimes} closed issues
			const { data: closedPRs } = await this.octokit.rest.pulls.list({
				owner: this.owner,
				repo: this.repo,
				state: "closed",
				per_page: numCloseTimes,
				last: numCloseTimes,
			});

			if (closedPRs.length === 0) {
				log.debug("No closed PRs found in the repository.");
				return null;
			}

			// Calculate the average time to close
			const averageTimeToClose =
				closedPRs.reduce((total: number, issue: any) => {
					if (issue.closed_at == null) {
						log.error("A closed PR does not have a closed date: ", issue.title);
						return 0;
					} else {
						const closedAt = new Date(issue.closed_at).getTime();
						const createdAt = new Date(issue.created_at).getTime();
						return total + (closedAt - createdAt);
					}
				}, 0) / closedPRs.length;

			// Convert milliseconds to days
			const averageDaysToClose = averageTimeToClose / (1000 * 60 * 60 * 24);

			return averageDaysToClose;
		} catch (error) {
			if (error instanceof RequestError || error instanceof GraphqlResponseError) {
				console.error("Error fetching data from GitHub:", error.message);
			} else {
				console.error("Non-Github error ", error);
			}
			return null;
		}
	}

	async getCloseRatio(): Promise<number | null> {
		//returns the ratio of (closed issues/all issues) last updated within the last 6 months
		//if this project has no issues updated within last 6 months, returns 0
		const today = new Date();
		today.setMonth(today.getMonth() - 6);
		const sixMonthsAgoISO = today.toISOString();
		try {
			const { repository } = await graphql(
				`
				query {
					repository(owner: "${this.owner}", name: "${this.repo}") {
						closed: issues(
						states: [CLOSED]
						filterBy: { since: "${sixMonthsAgoISO}" } 
						) {
							totalCount
						}
						all: issues(
							filterBy: {since: "${sixMonthsAgoISO}" }
						) {
							totalCount
						}
					}
				}
				`,
				{
					headers: {
						authorization: `token ${process.env.GITHUB_TOKEN}`,
					},
				},
			);

			return (
				repository.all.totalCount &&
				repository.closed.totalCount / repository.all.totalCount
			);
			//if no issues, return 0 (indicates lower responsiveness) else return ratio
		} catch (error) {
			if (error instanceof RequestError || error instanceof GraphqlResponseError) {
				console.error("Error fetching data from GitHub:", error.message);
			} else {
				console.error("Non-Github error ", error);
			}
			return null;
		}
	}

	async evaluate(): Promise<number> {
		const rawAverageDaysPR = await this.getAverageDaysPR(); //value >  0 | null
		const rawCloseRatio = await this.getCloseRatio(); // 1 >= value >= 0 | null
		if (rawAverageDaysPR == null || rawCloseRatio == null) {
			//handle error'd values as desired
			return 0;
		}

		const weightDaysPR = 0.8; //tune balance by changing this value
		const weightCloseRatio = 1 - weightDaysPR;

		const falloffHarshness = 0.3;
		//value within (0, 1), higher values punish more severely
		const scaledDaysPR = Math.exp(-falloffHarshness * rawAverageDaysPR);

		return scaledDaysPR * weightDaysPR + rawCloseRatio * weightCloseRatio;
	}
}

// A subclass of BaseMetric.
export class License extends BaseMetric {
	name = "License";
	description = "Determines if the license is compatable with LGPLv2.1.";

	private isCompatibleWithLGPL(readme: string): boolean {
		// Define Regular Expressions to match different licenses
		// https://www.gnu.org/licenses/license-list.html#GPLCompatibleLicenses
		// Used above link as a reference
		const licensesRegex = [
			/gpl/i,
			/gnu lesser general public license/i,
			/gnu general public license/i,
			/gnu affero public license/i,
			/gnu all-permissive license/i,
			/mit/i,
			/apache2/i, // NOTE: apache1 is not compatible with LGPLv2.1
			/apache 2/i,
			/apache-2/i,
			/apache license, version 2/i,
			/artistic/i,
			/bsd/i,
			/ldap/i,
			/cecill/i,
			/cryptix/i,
			/ecos/i,
			/ecl/i,
			/educational community license/i,
			/eiffel/i,
			/eu datagrid/i,
			/eudatagrid/i,
			/expat/i,
			/freetype/i,
			/hpnd/i,
			/historical permission notice and disclaimer/i,
			/imatrix/i,
			/imlib/i,
			/ijg/i,
			/independent jpeg/i,
			/informal license/i,
			/intel open source/i,
			/isc/,
			/mpl/i,
			/mozilla/i,
			/ncsa/i,
			/netscape/i,
			/perl/i,
			/python/i,
			/public domain/i,
			/license of ruby/i,
			/sgi free software/i,
			/ml of new jersey/i,
			/unicode/i,
			/upl/i,
			/universal permissive license/i,
			/unlicense/i,
			/vim/i,
			/w3c/i,
			/webm/i,
			/wtfpl/i,
			/wx/i,
			/x11/i,
			/xfree86/i,
			/zlib/i,
			/zope/i,
		];

		// Check if any of the license regex matches the README content
		for (const regex of licensesRegex) {
			if (readme.match(regex)) {
				return true;
			}
		}

		// Return false if no compatible license is found
		return false;
	}

	async getReadmeLicence(owner: string, repo: string): Promise<boolean | null> {
		try {
			// Fetch the README file from GitHub API
			const readmeResponse = await this.octokit.rest.repos.getReadme({
				owner,
				repo,
				mediaType: {
					format: "raw",
				},
			});

			const readmeContent =
				typeof readmeResponse.data === "string" ? readmeResponse.data : "";

			// Using a regex to find the license section of the README
			const licenseRegex = /(#+\s*License\s*|\bLicense\b\s*\n-+)([\s\S]*?)(#+|$)/i;
			const match = readmeContent.match(licenseRegex);
			if (match === null) {
				return null;
			}

			// Find if the license is compatible with LGPLv2.1
			if (this.isCompatibleWithLGPL(readmeContent)) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.error("Error fetching README: ", error);
			return null; // Will be read as 0 by evaluate()
		}
	}

	async evaluate(): Promise<number> {
		log.info("Evaluating License for", this.owner, this.repo);
		const isGpl = await this.getReadmeLicence(this.owner, this.repo);
		if (isGpl === true) {
			return 1;
		} else {
			return 0;
		}
	}
}

// A subclass of BaseMetric.
export class RampUp extends BaseMetric {
	name = "RampUp";
	description = "Measures how quickly a developer can get up to speed with the module.";

	private doesFileExist(dir: string, targetFile: string): boolean {
		try {
			const files = fs.readdirSync(dir, { withFileTypes: true });
			for (const file of files) {
				const filePath: string = path.join(dir, file.name);
				if (file.isDirectory()) {
					if (this.doesFileExist(filePath, targetFile)) {
						return true;
					}
				} else if (file.name === targetFile) {
					return true;
				}
			}
			return false;
		} catch (err) {
			log.error(`Error reading directory: ${err}`);
			return false;
		}
	}

	private calculateSlocToCommentRatio(dir: string): { sloc: number; comments: number } {
		// NOTE: Only finds comments in .js and .ts files
		// NOTE: Will only look at 10 files at maximum. This is to prevent the metric from taking too long.
		let sloc = 0;
		let comments = 0;

		const files = fs.readdirSync(dir, { withFileTypes: true });
		let numFilesParsed: number = 0;

		for (const file of files) {
			if (numFilesParsed >= 10) {
				break;
			}
			const filePath = path.join(dir, file.name);

			if (file.isDirectory()) {
				const subResult = this.calculateSlocToCommentRatio(filePath);
				sloc += subResult.sloc;
				comments += subResult.comments;
			} else if (file.name.endsWith(".js") || file.name.endsWith(".ts")) {
				log.debug(`Reading file for sloc to comment ratio: ${filePath}`);
				const fileContent = fs.readFileSync(filePath, "utf-8");
				const lines = fileContent.split("\n");
				let inCommentBlock = false;

				for (const line of lines) {
					const trimmedLine = line.trim();

					if (inCommentBlock) {
						comments++;
						if (trimmedLine.endsWith("*/")) {
							inCommentBlock = false;
						}
					} else if (trimmedLine.startsWith("/*")) {
						inCommentBlock = true;
						comments++;
					} else if (trimmedLine.startsWith("//")) {
						comments++;
					} else if (trimmedLine.length > 0) {
						sloc++;
					}
				}
			}
			numFilesParsed += 1; // We have parsed a file
		}

		return { sloc, comments };
	}

	async evaluate(): Promise<number> {
		log.info(`Evaluating RampUp for ${this.owner}/${this.repo}`);
		log.info(`Cloning ${this.owner}/${this.repo}`);

		// Create a temp directory and clone the repo into it
		const tmpdir = dirSync({ unsafeCleanup: true });
		log.info(`Created temp directory: ${tmpdir.name}`);
		log.info(`https://github.com/${this.owner}/${this.repo}.git`);
		try {
			await clone({
				fs,
				http,
				dir: tmpdir.name,
				url: `https://github.com/${this.owner}/${this.repo}.git`,
				singleBranch: true,
				depth: 1,
			});

			// See if there is a README.md
			log.info(`Finding ${this.owner}/${this.repo} README.md`);
			const doesReadmeExist: boolean = this.doesFileExist(tmpdir.name, "README.md");
			const readmeScore = doesReadmeExist ? 0.3 : 0;

			// See if there is a CONTRIBUTING.md
			log.info(`Finding ${this.owner}/${this.repo} CONTRIBUTING.md`);
			const doesContributingExist: boolean = this.doesFileExist(
				tmpdir.name,
				"CONTRIBUTING.md",
			);
			const contributingScore = doesContributingExist ? 0.3 : 0;

			// Find the sloc to comment ratio
			log.info(`Finding ${this.owner}/${this.repo} comment to sloc ratio`);
			const { sloc, comments } = this.calculateSlocToCommentRatio(tmpdir.name);
			const commentToSlocRatio = comments / (sloc || 1); // Avoid division by zero
			log.debug(`sloc: ${sloc}, comments: ${comments}, ratio: ${commentToSlocRatio}`);

			// scale that ratio to a number between 0 and 1
			const commentToSlocRatioScaled = Math.min(commentToSlocRatio, 1);
			const slocCommentRatioScore = commentToSlocRatioScaled * 0.4; // ratio of 50% is max score

			tmpdir.removeCallback(); // Cleanup the temp directory

			// Calculate the score and return it
			return readmeScore + contributingScore + slocCommentRatioScore;
		} catch (error) {
			console.error("Failure cloning");
			return 0;
		}
	}
}

// A subclass of BaseMetric.
export class Correctness extends BaseMetric {
	name = "Correctness";
	description = "Measures how many bugs are in the module.";

	async evaluate(): Promise<number> {
		// Check for GitHub workflow actions presence
		try {
			const hasWorkflowActions = await this.hasWorkflowActions();

			// Count TODO or FIXME comments
			const todoFixmeCount = await this.countTodoFixmeComments();

			// Get test coverage percentage
			//const testCoverage = await this.getTestCoverage();

			// Calculate the ratio of closed issues to total issues
			const { openIssues, closedIssues } = await this.getIssueCounts();

			log.debug("openIssues:", openIssues);
			log.debug("closedIssues:", closedIssues);

			let issueRatio = 0;
			if (openIssues + closedIssues !== 0) {
				issueRatio = closedIssues / (openIssues + closedIssues);
			} else {
				console.warn("Both open and closed issues count are zero.");
			}

			// Logging the components
			log.debug("hasWorkflowActions:", hasWorkflowActions);
			log.debug("todoFixmeCount:", todoFixmeCount);
			// log.debug("testCoverage:", testCoverage);
			log.debug("issueRatio:", issueRatio);

			// Combine all factors to calculate the metric
			const score =
				(hasWorkflowActions ? 0.3 : 0) +
				(todoFixmeCount !== 0 ? (1 / todoFixmeCount) * 0.2 : 0) +
				issueRatio * 0.2;
			// testCoverage * 0.3 +
			return score;
		} catch {
			console.error(
				"Error: Score computed is NaN. See earlier error trace for more details.",
			);
			return 0;
		}
	}
	async getIssueCounts(): Promise<{ openIssues: number; closedIssues: number }> {
		let openIssuesCount = 0;
		let closedIssuesCount = 0;

		try {
			const openIssuesResponse = await this.octokit.rest.issues.listForRepo({
				owner: this.owner,
				repo: this.repo,
				state: "open",
				per_page: 1,
			});

			openIssuesCount = openIssuesResponse.data.length; // Assuming the length gives the count

			const closedIssuesResponse = await this.octokit.rest.issues.listForRepo({
				owner: this.owner,
				repo: this.repo,
				state: "closed",
				per_page: 1,
			});

			closedIssuesCount = closedIssuesResponse.data.length; // Assuming the length gives the count
		} catch (error) {
			console.error("Error fetching issue counts:", error);
		}

		return { openIssues: openIssuesCount, closedIssues: closedIssuesCount };
	}

	private async hasWorkflowActions(): Promise<boolean> {
		try {
			// Try to get the workflows directory. If it exists, return true.
			await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
				owner: this.owner,
				repo: this.repo,
				path: ".github/workflows",
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	private async countTodoFixmeComments(): Promise<number> {
		let count = 0;

		try {
			const files = await this.octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
				owner: this.owner,
				repo: this.repo,
				path: "", // Root directory
			});

			if (Array.isArray(files.data)) {
				for (const file of files.data) {
					if (file.type === "file" && file.content) {
						const decodedContent = Buffer.from(file.content, "base64").toString("utf8");
						count += (decodedContent.match(/TODO/g) || []).length;
						count += (decodedContent.match(/FIXME/g) || []).length;
					}
				}
			}
		} catch (error) {
			console.error("Error evaluating Correctness metric:", error);
			throw new Error("Failed to evaluate Correctness metric");
		}

		return count;
	}

	// private async getTestCoverage(): Promise<number> {
	// 	// Placeholder method. You need to decide how to get test coverage and implement here.
	// 	// For now, returning a dummy value.
	// 	return 0.5;
	// }
}

export class PullRequests extends BaseMetric {
	name = "PullRequestsCodeReviewMetric";
	description = "Measures the fraction of code introduced through pull requests with code reviews.";

	async evaluate(): Promise<number> {
		try {
			//Fetch information about pull requests and code reviews using GitHub API

			//Replace these with actual API calls and data processing 
			const totalCodeChanges = await this.getTotalCodeChanges(); //Total lines of code changes in the repository
			const codeIntroducedThroughPRs = await this.getPullRequestsWithCodeReviews(); //Lines of code introduced through Pull Requests with code reviews

			let codeReviewFraction = 0; 
			//Calculate the fraction of code introduced through PRs with code reviews
			if(totalCodeChanges >= codeIntroducedThroughPRs) {
				codeReviewFraction = codeIntroducedThroughPRs / totalCodeChanges; 
			} 
			else {
				codeReviewFraction = 1; 
			}

			return codeReviewFraction; 
		} catch (error) {
			console.error("Error calculating PullRequestsCodeReviewMetric:", error);
			throw new Error("Failed to evaluate Pull Request metric");
		}
	}

	async getTotalCodeChanges(): Promise<number> {
		try {
			const pullRequests = await this.octokit.rest.pulls.list({
				owner: this.owner, 
				repo: this.repo, 
				state: 'all',  
			}); 
			
			let totalChanges = 0;

			for (const pr of pullRequests.data) {
				// Fetch the PR's commits
				const stats = await this.octokit.rest.pulls.get({
					owner: this.owner,
					repo: this.repo,
					pull_number: pr.number,
				});
		
				totalChanges += stats.data.additions + stats.data.deletions;
			}
		
			return totalChanges;
		} catch (error) {
			console.error("Error fetching code change statistics:", error); 
			return 0; 
		}
	}
	
	async getPullRequestsWithCodeReviews(): Promise<number> { //this code currently considers Pull Request with review comments as having a code review
		try{
			const pullRequests = await this.octokit.rest.pulls.list({
				owner: this.owner, 
				repo: this.repo, 
				state: 'all', 
			}); 

			let totalChanges = 0;

			for (const pr of pullRequests.data) {
				// Fetch the PR's review comments
				const reviewComments = await this.octokit.rest.pulls.listReviewComments({
				owner: this.owner,
				repo: this.repo,
				pull_number: pr.number,
				});
		
				if (reviewComments.data.length > 0) {
					// If there are review comments, consider it a code review
					// Fetch the PR's statistics
					const stats = await this.octokit.rest.pulls.get({
						owner: this.owner,
						repo: this.repo,
						pull_number: pr.number,
					});
			
					totalChanges += stats.data.additions + stats.data.deletions;
				}
			}

			return totalChanges;
		} catch (error) {
			console.error('Error fetching data from GitHub:', error);
			return 0; // Handle errors as needed
		}
    }
}

// A subclass of BaseMetric.
export class DependencyPins extends BaseMetric {
	name = "DependencyPins";
	description = "Measures the fraction of dependencies that are pinned to a specific version.";

	async evaluate(): Promise<number> {
		try {
			// Fetch the package.json file
			const packageJson = await this.octokit.rest.repos.getContent({
				owner: this.owner,
				repo: this.repo,
				path: "package.json",
			});

			// Parse the JSON
			if (Array.isArray(packageJson.data)) {
				const content = packageJson.data[0].content;
				if (content === undefined) {
					return 1;
				}
				// Note: packageJson.data has attribute content?: string | undefined
				const packageJsonContent = Buffer.from(content, "base64").toString(
					"utf8",
				);
				const packageJsonParsed = JSON.parse(packageJsonContent);

				// Get total number of dependencies and check for 0/undefined
				const numDependencies = (packageJsonParsed.dependencies) ? Object.keys(packageJsonParsed.dependencies)?.length : undefined;
				if (numDependencies === undefined || numDependencies === 0) {  // return 0 on undefined?
					return 1;
				}

				// Calculate the number of dependencies that are pinned
				const pinnedDependencies = this.numPinnedDeps(packageJsonParsed.dependencies);

				// Calculate the fraction of dependencies that are pinned
				const fractionPinned = pinnedDependencies / numDependencies;

				return Math.min(fractionPinned, 1);
			} else {
				return 1;
			}
		} catch (error) {
			console.error("Error calculating DependencyPins:", error);
			return 0;
		}
	}

	private numPinnedDeps(dependencies: string[]): number {
		let pinnedDeps = 0;

		for (const dependency in dependencies) {
			const version = dependencies[dependency];
			if (/^(?:\d+\.\d+\.\d+|\d+\.\d+(\.[\d+\*Xx])?|~\d+\.\d+(\.\d+)?|\^0\.\d+(\.\d+)?|\d+\.\d+(\.[\*Xx])?)$/.test(version)) {
				pinnedDeps++;
			}
		}

		return pinnedDeps;
	}
}
