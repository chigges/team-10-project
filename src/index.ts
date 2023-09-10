#!/usr/bin/env node
import { setupCLI } from "./cli";
import { tsAPI } from "./api-v1"

console.log("before setup");
setupCLI();
console.log("after setup");

tsAPI()