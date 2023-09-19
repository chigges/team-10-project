import { Command } from "commander";
import URLParser from "./URLParser";
import { exec } from "child_process";

export function setupCLI() {
	const program = new Command();

	program.version("0.0.1").description("A CLI for trustworthy module reuse");

	program
		.command("install")
		.description("Installs dependencies")
		.action(() => {
			exec("npm ci", (error, stdout, stderr) => {
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
		.action(() => {
			console.log("running tests (but not really)");
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
