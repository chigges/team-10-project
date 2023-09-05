import { Command } from "commander";

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

	program.parse();
}
