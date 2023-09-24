#!/usr/bin/env node
import "dotenv/config"; // loads .env file into process.env. NOTE: this should be the first line
import { setupCLI } from "./cli";

// Run the evaluation

setupCLI();
