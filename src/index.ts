#!/usr/bin/env node
import "dotenv/config"; // loads .env file into process.env. NOTE: this should be the first line
import { setupCLI } from "./cli";
/* TODO: Uncomment this when implemented. ESLint will complain about unused variables.
import { Metric, BusFactor, Responsiveness, License, Correctness, RampUp } from "./metrics";

// TODO: make it use environment variable (process.env.GITHUB_TOKEN)
const githubToken = "my-token";
const repoUrl = "https://github.com/your-org/your-repo";

const metrics: Metric[] = [
	new Responsiveness(repoUrl, githubToken),
	new BusFactor(repoUrl, githubToken),
	new License(repoUrl, githubToken),
	new Correctness(repoUrl, githubToken),
	new RampUp(repoUrl, githubToken),
];

async function evaluateAllMetrics() {
	console.log(`{}`);
	for (const metric of metrics) {
		const score = await metric.evaluate();
		console.log(`Metric: ${metric.name}`);
		console.log(`Description: ${metric.description}`);
		console.log(`Score: ${score}`);
	}
}
*/

// Run the evaluation

setupCLI();
