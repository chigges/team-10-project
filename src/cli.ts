import { Command } from "commander";
import URLParser from "./URLParser";

export function setupCLI() {
	const program = new Command();

	program.version("0.0.1").description("A CLI for trustworthy module reuse");

	program
		.command("install")
		.description("Installs dependencies")
		.action(() => {
			console.log("installing dependencies (but not really)");
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
		});

	program.parse();
}
