import { Request, Response } from 'express';
import { Package, AuthenticationToken, PackageId, PackageName, PackageData } from '../types';
import { log } from '../logger';
import { DynamoDBClient, PutItemCommand, GetItemCommand, PutItemCommandInput, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { Credentials } from 'aws-sdk';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v5 as uuidv5 } from 'uuid';
import URLParser from '../URLParser';
import { BusFactor, Responsiveness, Correctness, License, RampUp, PullRequests, DependencyPins } from "../metrics";
import { tmpNameSync } from 'tmp';
import { Logger } from 'tslog';

// Set up AWS credentials programmatically
const credentials = new Credentials({
  accessKeyId: 'AKIARHTPY2GO3NMFRGVH',
  secretAccessKey: '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',
});

const client = new DynamoDBClient({ region: "us-east-1", credentials: credentials });

// Controller function for handling the GET request to /package/{id}
export const getPackageById = (req: Request, res: Response) => {
  try {
    const packageId: PackageId = req.params.id; // Extract the package ID from the URL

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to retrieve the package (you can add more logic here)

    // Retrieve the package with the specified ID from your data source (e.g., a database)
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
      },
    };

    let package1: Package | undefined = undefined;

    const command = new GetItemCommand(params);
    client.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
        package1 = {
          metadata: {
            "Name": response.Item?.name?.S || "",
            "Version": response.Item?.version?.S || "",
            "ID": packageId
          },
          data: {
            "Content": "",
            "JSProgram": "",
          }
        }
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        // throw(error);
      });

    if (!package1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Respond with the retrieved package
    res.status(200).json(package1);
  } catch (error) {
    log.error('Error handling GET /package/{id}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

// Controller function for handling the PUT request to update a package by ID
export const updatePackage = (req: Request, res: Response) => {
  try {
    const packageId: PackageId = req.params.id; // Extract the package ID from the URL
    const packageName: PackageName = req.params.name;
    const packageVersion = req.params.version;

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
    return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Get the Package from the request body
    //const package1: Package = req.body as Package;

    //const name = package1.metadata.Name;
    //const version = package1.metadata.Version; 
    //const id = package1.metadata.ID;

    // Validate request body for the package data (replace with your own validation logic)

    // Check if the package with the given ID exists
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
        name: { S: packageName },
        version: { S: packageVersion },
      },
    };

    const command = new GetItemCommand(params);
    client.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });

    // Update the package data (replace with your own logic)

    // Respond with a success message
    res.status(200).json({ message: 'Package updated successfully' });
  } catch (error) {
      log.error('Error handling PUT /package/:id:', error);
      res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

// Controller function for handling the DELETE request to /package/:id
export const deletePackage = (req: Request, res: Response) => {
  try {
    const packageId: PackageId = req.params.id; // Extract the package ID from the URL

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
    return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to delete the package (you can add more logic here)

    // Perform the package deletion (replace this with your logic)
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
      },
    };
    
    const command = new DeleteItemCommand(params);
    client.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });

    // Respond with a success message
    res.status(200).json({ message: 'Package is deleted' });
  } catch (error) {
    log.error('Error handling DELETE /package/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

const generatePackageId = (name: string, version: string): PackageId => {
  const namespace = '1b671a64-40d5-491e-99b0-da01ff1f3341';
  const uuid = uuidv5(name + version, namespace);
  // create a 64-bit integer from the uuid
  return BigInt.asUintN(64, BigInt(`0x${uuid.replace(/-/g, '')}`)).toString();
}

type PackageInfo = {
  ID: string;
  NAME: string;
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

async function metricCalcFromUrl(url: string): Promise<PackageInfo | null> {
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

// Controller function for handling the POST request to /package
export async function createPackage(req: Request, res: Response) {
  try {
    // Extract the package data from the request body
    const packageData: PackageData = req.body as PackageData;
    log.info("createPackage request:", packageData);

    // Get the Package from the request body
    //const package1: Package = req.body as Package;

    // Verify the X-Authorization header for authentication
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to create a package (you can add more logic here)


    // Check that package creation request is valid (only Content or URL is set)
    // If request is valid, rate package (valid if rating >= 0.5)
    let info: PackageInfo | null;
    if (!((packageData.Content == '') !== (packageData.URL == ''))) {
      return res.status(400).json({ error: 'Invalid package creation request: Bad set of Content and URL' });
    } else if (packageData?.Content) {
      // TODO: implement zip upload
      return res.status(400).json({ error: 'Invalid package creation request: Zip upload unimplemented' });
    } else if (packageData?.URL) {
      info = await metricCalcFromUrl(packageData.URL);
      log.info("ingest via URL info:", info);
      if (info == null) {
        return res.status(400).json({ error: 'Invalid package creation request: Could not get GitHub url' });
      // } else if (info.NET_SCORE < 0.5) {
      } else if (info.NET_SCORE < 0.4) {
        return res.status(424).json({ error: 'Invalid package creation request: Package can not be uploaded due to disqualifying rating.' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid package creation request: Bad set of Content and URL' });
    }

    // If valid, generate package ID from name and version
    const id: PackageId = generatePackageId(info.NAME, info.VERSION);
    info.ID = id;

    // Check if package exists already
    if (false) {  // TODO: check if package exists
      return res.status(409).json({ error: 'Invalid package creation request: Package already exists' });
    }

    // Create the package
    const params: PutItemCommandInput = {
      TableName: "packages",
      Item: {
        id: { N: id },
        version: { S: info.VERSION },
        name: { S: info.NAME },
        Value: { S: JSON.stringify(info) },
      },
    };

    const command = new PutItemCommand(params);
    client.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });

    // TODO: upload package content to S3 bucket and make reference in database

    // Respond with a success message and the created package data
    const createdPackage = [ /* Replace with your package creation logic */ 
    {
        "metadata": {
          "Name": info.NAME,
          "Version": info.VERSION,
          "ID": id
        },
        "data": {
          "Content": "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",
          // "JSProgram": "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n"
        }
    }];
    res.status(201).json(createdPackage);
  } catch (error) {
    log.error('Error handling POST /package:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};
