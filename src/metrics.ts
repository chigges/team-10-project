import { Octokit, RequestError } from "octokit";
import fetch from "node-fetch";
const { graphql } = require("@octokit/graphql");
import fs from "fs";
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
			// Octokit errors always have a `error.status` property which is the http response code nad it's instance of RequestError
			if (error instanceof RequestError) {
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

	async evaluate(): Promise<number> {
		return 0.5; // Just a placeholder. TODO: implement.
	}
}

// A subclass of BaseMetric.
export class License extends BaseMetric {
	name = "License";
	description = "Determines if the license is compatable with LGPLv2.1.";

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

			// Using a regex to find if the license is GPL
			const gplShortRegex = /gpl/i;
			const gplLongRegex = /GNU General Public License/i;
			const gplShortMatch = match[2].trim().match(gplShortRegex);
			const gplLongMatch = match[2].trim().match(gplLongRegex);
			if (gplShortMatch || gplLongMatch) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			log.debug("Error fetching README for license: ", error);
			return null;
		}
	}

	async evaluate(): Promise<number> {
		const isGpl = await this.getReadmeLicence(this.repo, this.owner);
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
		let sloc = 0;
		let comments = 0;

		const files = fs.readdirSync(dir, { withFileTypes: true });

		for (const file of files) {
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
		}

		return { sloc, comments };
	}

	async evaluate(): Promise<number> {
		log.info(`Evaluating RampUp for ${this.owner}/${this.repo}`);
		log.info(`Cloning ${this.owner}/${this.repo}`);

		// Create a temp directory and clone the repo into it
		const tmpdir = dirSync({ unsafeCleanup: true });
		await clone({
			fs,
			http,
			dir: tmpdir.name,
			corsProxy: "https://cors.isomorphic-git.org",
			url: `https://github.com/${this.owner}/${this.repo}`,
			singleBranch: true,
			depth: 1,
		});

		// See if there is a README.md
		log.info(`Finding ${this.owner}/${this.repo} README.md`);
		const doesReadmeExist: boolean = this.doesFileExist(tmpdir.name, "README.md");
		const readmeScore = doesReadmeExist ? 0.3 : 0;

		// See if there is a CONTRIBUTING.md
		log.info(`Finding ${this.owner}/${this.repo} CONTRIBUTING.md`);
		const doesContributingExist: boolean = this.doesFileExist(tmpdir.name, "CONTRIBUTING.md");
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
	}
}

// A subclass of BaseMetric.
export class Correctness extends BaseMetric {
	name = "Correctness";
	description = "Measures how many bugs are in the module.";

	async evaluate(): Promise<number> {
		return 0.5; // Just a placeholder. TODO: implement.
	}
}
