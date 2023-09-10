#!/usr/bin/env node
import { setupCLI } from "./cli";
import { getClones, getMe } from "./api-v1"

console.log("before setup");
setupCLI();
console.log("after setup");

getClones("CtrlAltDelight", "team-10-project")