import { Command } from "commander";
import URLParser from "./URLParser";
import { exec } from "child_process";
import { runCLI } from "jest";

export function setupCLI() {
	const program = new Command();

	program.version("0.0.1").description("A CLI for trustworthy module reuse");

	program
		.command("install")
		.description("Installs dependencies")
		.action(() => {
			exec("npm ci", (error, stdout) => {
				if (error) {
					console.error(`Error during installation: ${error}`);
					return;
				}

				// Extract the number of packages installed
				const regex = /added (\d+) packages/i;
				const match = stdout.match(regex);
				if (match && match[1]) {
					console.log(`${match[1]} dependencies installed...`);
				} else {
					// could not determine amount of dependencies installed
					console.log("Installed dependencies...");
				}
			});
		});

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
				collectCoverageFrom: ["src/**/*.{js,ts}", "!**/node_modules/**"],
				reporters: ["default"],
				silent: true,
				verbose: false,
			};

			// Been working at this for a long time. I'm not sure how to get the types to work here.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const { results } = await runCLI(config as any, [process.cwd()]);

			// Restore stdout and stderr
			process.stdout.write = originalStdoutWrite;
			process.stderr.write = originalStderrWrite;

			// Get test results and print them
			const totalTests = results.numTotalTests;
			const passedTests = results.numPassedTests;
			const coverage = results.coverageMap
				? results.coverageMap.getCoverageSummary().toJSON().lines.pct
				: 0;

			console.log(`Total: ${totalTests}`);
			console.log(`Passed: ${passedTests}`);
			console.log(`Coverage: ${coverage}%`);
			console.log(
				`${passedTests}/${totalTests} test cases passed. ${coverage}% line coverage achieved.`,
			);
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
