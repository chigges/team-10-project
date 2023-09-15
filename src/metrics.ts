import { Octokit } from "octokit";
import process from "process";

export interface Metric {
	name: string;
	description: string;
	evaluate(): Promise<number>;
}

// This is our class for all metrics.
export abstract class BaseMetric implements Metric {
	// NOTE: Not necessary to implement the interface properties, but I think it's good practice.
	//       Also, initializing a default value. These will get overwritten by the subclass.
	name: string = "BaseMetric";
	description: string = "BaseMetricDescription";
	repoUrl: string;
	octokit: Octokit;

	constructor(repoUrl: string, githubToken: string) {
		this.repoUrl = repoUrl;

		// NOTE: I'm not sure, but I think we need an Octokit for each metric
		//       I'll put this here, but feel free to change this.
		this.octokit = new Octokit({ auth: githubToken });
	}

	abstract evaluate(): Promise<number>;
}

// A subclass of BaseMetric.
export class BusFactor extends BaseMetric {
	name = "BusFactor";
	description = "Measures how many developers are essential for the project.";

	async evaluate(): Promise<number> {
		return 0.5; // Just a placeholder. TODO: implement.
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

	async evaluate(): Promise<number> {
		return 0.5; // Just a placeholder. TODO: implement.
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

export class Subs extends BaseMetric {
	name = "Subs";
	description = "Measures # subs.";

	octokit = new Octokit({ auth: process.env.SECRET_WORD });

	async evaluate(): Promise<number> {
		const repos = await this.octokit.rest.repos.get({
			owner: "neovim",
			repo: "neovim",
		});
		return repos.data.subscribers_count;
	}
}
