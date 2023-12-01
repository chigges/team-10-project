import "dotenv/config"; // loads .env file into process.env. NOTE: this should be the first line
import { Logger } from "tslog";
import { appendFileSync } from "fs";

export const log = new Logger({
	name: "Logger",
	minLevel: 7,
}); // no messages by default

if (process.env.LOG_LEVEL === "1") {
	// only log.info, log.warn, log.error, and log.fatal
	log.settings.minLevel = 3;
} else if (process.env.LOG_LEVEL === "2") {
	// all logs
	log.settings.minLevel = 0;
}

// Set output file
log.attachTransport((logObj) => {
	// Must have a LOG_FILE environment variable set
	if (process.env.LOG_FILE === undefined) {
		console.error("LOG_FILE environment variable not set");
		process.exit(1);
	}
	appendFileSync(process.env.LOG_FILE, JSON.stringify(logObj) + "\n");
	// Log to file in format: [2021-03-31T21:00:00.000Z] [INFO] Logger: Hello World
	// appendFileSync(
	// 	process.env.LOG_FILE,
	// 	`[${logObj.date.toISOString()}] [${logObj.logLevel.toUpperCase()}] ${logObj.name}: ${logObj.argumentsArray.join(
	// 		" "
	// 	)}\n`
	// );
});
