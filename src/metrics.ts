import { Octokit, RequestError } from "octokit";
import fetch from "node-fetch";
const { graphql } = require("@octokit/graphql");
import { OctokitResponse } from "@octokit/types";
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
				console.log("No closed PRs found in the repository.");
				return null;
			}

			// Calculate the average time to close
			const averageTimeToClose =
				closedPRs.reduce((total, issue) => {
					if (issue.closed_at == null) {
						console.error("A closed PR does not have a closed date: ", issue.title);
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
			if (error instanceof RequestError) {
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
			if (error instanceof RequestError) {
				console.error("Error fetching data from GitHub:", error.message);
			} else {
				console.error("Non-Github error ", error);
			}
			return null;
		}
	}

	async evaluate(): Promise<number> {
		let rawAverageDaysPR = await this.getAverageDaysPR(); //value >  0 | null
		let rawCloseRatio = await this.getCloseRatio(); // 1 >= value >= 0 | null
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
			console.error("Error fetching README: ", error);
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

	async evaluate(): Promise<number> {
		return 0.5; // Just a placeholder. TODO: implement.
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
