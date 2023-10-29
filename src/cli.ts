import { Command } from "commander";
import URLParser from "./URLParser";
import { runCLI } from "jest";
import { BusFactor, Responsiveness, Correctness, License, RampUp, PullRequests, DependencyPins } from "./metrics";
import { log } from "./logger";

export function setupCLI() {
	const program = new Command();

	program.version("0.0.1").description("A CLI for trustworthy module reuse");

	// NOTE:  ./run install is handled completely within the ./run file.

	program
		.command("test")
		.description("Runs tests")
		.action(async () => {
			// Mute stdout and stderr
			const originalStdoutWrite = process.stdout.write.bind(process.stdout);
			process.stdout.write = () => true;
			const originalStderrWrite = process.stderr.write.bind(process.stderr);
			process.stderr.write = () => true;

			// Setup and run jest tests
			const config = {
				collectCoverage: true,
				reporters: ["default"],
				silent: true,
				verbose: false,
				preset: "ts-jest",
				testEnvironment: "node",
				setupFiles: ["dotenv/config"],
				testTimeout: 20000,
			};

			// Been working at this for a long time. I'm not sure how to get the types to work here.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { results } = await runCLI(config as any, [process.cwd() + "/jest.config.js"]);

			// Restore stdout and stderr
			process.stdout.write = originalStdoutWrite;
			process.stderr.write = originalStderrWrite;

			// Get test results and print them
			const totalTests = results.numTotalTests;
			const passedTests = results.numPassedTests;
			const coverage = results.coverageMap
				? results.coverageMap.getCoverageSummary().toJSON().lines.pct
				: 0;

			console.log(
				`${passedTests}/${totalTests} test cases passed. ${Math.ceil(
					coverage,
				)}% line coverage achieved.`,
			);
		});

	program
		.arguments("<file>")
		.description("Takes in a file of URLs and outputs the score of each repo")
		.action(async (file) => {
			// You need a LOG_FILE and GITHUB_TOKEN env variable to run this command

			const isNoLogFileEnv =
				process.env.LOG_FILE === undefined || process.env.LOG_FILE === "";
			const isNoGithubTokenEnv =
				process.env.GITHUB_TOKEN === undefined || process.env.GITHUB_TOKEN === "";
			if (isNoLogFileEnv || isNoGithubTokenEnv) {
				process.exit(1);
			}

			type RepoMetricInfo = {
				URL: string;
				NET_SCORE: number;
				RAMP_UP_SCORE: number;
				CORRECTNESS_SCORE: number;
				BUS_FACTOR_SCORE: number;
				RESPONSIVE_MAINTAINER_SCORE: number;
				LICENSE_SCORE: number;
				PULL_REQUESTS_SCORE: number;
				PINNED_DEPENDENCIES_SCORE: number;
			};
			const urlParser = new URLParser(file);
			const repoInfoList = await urlParser.getGithubRepoInfo();
			const RepoMetricInfoList: RepoMetricInfo[] = [];
			for (const repoInfo of repoInfoList) {
				//Ramp Up Score
				const rampupMetric = new RampUp(repoInfo.owner, repoInfo.repo);
				const rampupMetricScore = await rampupMetric.evaluate();
				//Correctness Score
				const correctnessMetric = new Correctness(repoInfo.owner, repoInfo.repo);
				const correctnessMetricScore = await correctnessMetric.evaluate();
				//Bus Factor Score
				const busFactorMetric = new BusFactor(repoInfo.owner, repoInfo.repo);
				const busFactorMetricScore = await busFactorMetric.evaluate();
				//Responsiveness Score
				const responsivenessMetric = new Responsiveness(repoInfo.owner, repoInfo.repo);
				const responsivenessMetricScore = await responsivenessMetric.evaluate();
				//License Score
				const licenseMetric = new License(repoInfo.owner, repoInfo.repo);
				const licenseMetricScore = await licenseMetric.evaluate();

				const pullrequestsMetric = new PullRequests(repoInfo.owner, repoInfo.repo);
				const pullrequestsMetricScore = await pullrequestsMetric.evaluate(); 
				
				const pinnedDependenciesMetric = new DependencyPins(repoInfo.owner, repoInfo.repo);
				const pinnedDependenciesMetricScore = await pinnedDependenciesMetric.evaluate();

				/*
				console.log("Ramp Up Score: " + rampupMetricScore);
				console.log("Correctness Score: " + correctnessMetricScore);
				console.log("Bus Factor Score: " + busFactorMetricScore);
				console.log("Responsiveness Score: " + responsivenessMetricScore);
				console.log("License Score: " + licenseMetricScore);
				*/
				// console.log("Pull Request Score:" + pullrequestsMetricScore);

				const netScore =
					(rampupMetricScore * 0.2 +
						correctnessMetricScore * 0.1 +
						busFactorMetricScore * 0.25 +
						responsivenessMetricScore * 0.25 +
						pullrequestsMetricScore * 0.1 + 
						pinnedDependenciesMetricScore * 0.1) *
					licenseMetricScore;

				log.debug("Net Score: " + netScore);

				const currentRepoInfoScores: RepoMetricInfo = {
					URL: repoInfo.url,
					NET_SCORE: netScore,
					RAMP_UP_SCORE: rampupMetricScore,
					CORRECTNESS_SCORE: correctnessMetricScore,
					BUS_FACTOR_SCORE: busFactorMetricScore,
					RESPONSIVE_MAINTAINER_SCORE: responsivenessMetricScore,
					LICENSE_SCORE: licenseMetricScore,
					PULL_REQUESTS_SCORE: pullrequestsMetricScore,
					PINNED_DEPENDENCIES_SCORE: pinnedDependenciesMetricScore,
				};

				RepoMetricInfoList.push(currentRepoInfoScores);
			}

			for (const repoInfo of RepoMetricInfoList) {
				console.log(JSON.stringify(repoInfo));
			}
		});

	program
		.command("test:URLParser")
		.description("Runs manual tests for URLParser")
		.action(() => {
			const urlParser = new URLParser("./Sample Url File.txt");
			const urls = urlParser.getUrls();
			console.log(urls);

			urlParser.getOnlyGithubUrls().then((urls) => {
				console.log(urls);
			});

			urlParser.getGithubRepoInfo().then((info) => {
				console.log(info);
			});
		});

	program.parse();
}
