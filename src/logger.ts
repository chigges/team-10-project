import "dotenv/config"; // loads .env file into process.env. NOTE: this should be the first line
import { Logger } from "tslog";
import { createWriteStream, appendFileSync } from "fs";

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
	// NOTE: Default log output of "log.txt" if not LOG_FILE env var is set
	appendFileSync(process.env.LOG_FILE || "log.txt", JSON.stringify(logObj) + "\n");
});

log.debug("This is a debug message");
log.info("This is an info message");
log.warn("This is a warning message");
