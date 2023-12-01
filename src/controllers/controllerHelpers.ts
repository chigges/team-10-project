import { PackageId, User } from '../types';
import { log } from '../logger';
import { v5 as uuidv5 } from 'uuid';
import URLParser from '../URLParser';
import { BusFactor, Responsiveness, Correctness, License, RampUp, PullRequests, DependencyPins } from "../metrics";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

export const dbclient = new DynamoDBClient({ region: "us-east-1" });
export const s3client = new S3Client({ region: "us-east-1" });

export type PackageInfo = {
	ID: string;
	NAME: string;
	OWNER: string;
	VERSION: string;
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

export const defaultUser: User = {
	isAdmin: true,
	name: 'James Davis',
}; 

export const generatePackageId = (name: string, version: string): PackageId => {
	log.debug(`Generating id for ${name}@${version}`);
	const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341';
	const uuid = uuidv5(name + version, namespace);
	// create a 64-bit integer from the uuid
	const id = BigInt.asUintN(64, BigInt(`0x${uuid.replace(/-/g, '')}`)).toString();
	log.debug(`Generated package id ${id} for ${name}@${version}`);
	return id;
};

export async function metricCalcFromUrl(url: string): Promise<PackageInfo | null> {
  const urlParser = new URLParser("");
  const repoInfo = await urlParser.getGithubRepoInfoFromUrl(url);
  log.info("repoInfo:", repoInfo);
	if (repoInfo == null) {
			return null;
	}
  
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
	// Pull Requests Score
	const pullrequestsMetric = new PullRequests(repoInfo.owner, repoInfo.repo);
	const pullrequestsMetricScore = await pullrequestsMetric.evaluate(); 
	// Pinned Dependencies Score
	const pinnedDependenciesMetric = new DependencyPins(repoInfo.owner, repoInfo.repo);
	const pinnedDependenciesMetricScore = await pinnedDependenciesMetric.evaluate();

	const netScore =
		(rampupMetricScore * 0.2 +
		correctnessMetricScore * 0.1 +
		busFactorMetricScore * 0.25 +
		responsivenessMetricScore * 0.25 +
		pullrequestsMetricScore * 0.1 + 
		pinnedDependenciesMetricScore * 0.1) *
		licenseMetricScore;

	const currentRepoInfoScores: PackageInfo = {
		ID: "",
		NAME: repoInfo.repo,
		OWNER: repoInfo.owner,
		VERSION: "1.0.0",
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
	// log.info("currentRepoInfoScores:", currentRepoInfoScores);

	return currentRepoInfoScores;
}

export function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
