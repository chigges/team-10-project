import { Request, Response } from 'express';
import { Package, AuthenticationToken, PackageId, PackageName, PackageData } from '../types';
import { log } from '../logger';
import { DynamoDBClient, PutItemCommand, GetItemCommand, PutItemCommandInput, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { generatePackageId, metricCalcFromUrl, PackageInfo } from './controllerHelpers';
import AdmZip = require("adm-zip");

const dbclient = new DynamoDBClient({ region: "us-east-1" });
const s3client = new S3Client({ region: "us-east-1" });

// Controller function for handling the GET request to /package/{id}
export async function getPackageById (req: Request, res: Response) {
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

    // Check if id is defined
    if (!packageId) {
      return res.status(400).json({ error: 'Missing package ID' });
    }

    // Retrieve the package with the specified ID from your data source (e.g., a database)
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
      },
    };

    let package1: Package | undefined = undefined;

    const command = new GetItemCommand(params);
    await dbclient.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
        if (response.Item) {
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
        }
      })
      .catch((error) => {
        log.error("Error getting item:", error);
      });

    if (!package1) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Get package content from S3 bucket
    let content: string | undefined = undefined;
    const s3params = {
      Bucket: "pckstore",
      Key: "packages/" + packageId + ".zip",
    };
    await s3client.send(new GetObjectCommand(s3params))
      .then(async (response) => {
        log.info("GetObject succeeded, downloaded from S3:", response.$metadata);
        await response.Body?.transformToString('base64').then((arrayBuffer) => {
          content = arrayBuffer;
          // package1!.data!.Content = content;  // TODO: uncomment when front-end can handle file downloading
        });
        log.info("Received content");
      })
      .catch((error) => {
        log.error("Error downloading object from S3:", error);
      });
    
    if (content == null) {
      return res.status(404).json({ error: 'Package content not found' });
    }

    // Respond with the retrieved package
    res.status(200).json(package1);
  } catch (error) {
    log.error('Error handling GET /package/{id}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}

// Controller function for handling the PUT request to update a package by ID
export async function updatePackage(req: Request, res: Response) {
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

    // Check if name and version match id
    if (generatePackageId(packageName, packageVersion) !== packageId) {
      return res.status(400).json({ error: 'Package name and version do not match package ID' });
    }

    // Get the Package from the request body
    const updatedPackageData: PackageData = req.body as PackageData;

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
    let exists: boolean = false;
    const command = new GetItemCommand(params);
    await dbclient.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
        if (response.Item) {
          exists = true;
        }
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });
    if (!exists) {
      return res.status(404).json({ error: 'Package does not already exist' });
    }

    // TODO: Update the package data in S3 bucket + database metadata

    // Respond with a success message
    res.status(200).json({ message: 'Package updated successfully' });
  } catch (error) {
    log.error('Error handling PUT /package/:id:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}

// Controller function for handling the DELETE request to /package/:id
export async function deletePackage(req: Request, res: Response) {
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
    await dbclient.send(command)
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
}

// Controller function for handling the POST request to /package
export async function createPackage(req: Request, res: Response) {
  try {
    // Extract the package data from the request body
    const packageData: PackageData = req.body as PackageData;

    let id: PackageId, s3path: string = "";

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
      log.info("createPackage request via zip upload");
      const zipBuffer = Buffer.from(atob(packageData.Content.split(",")[1]), 'binary');

      // Extract package.json from zip file
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();
      let packageJson: string | null = null;
      let packageJsonContent;
      zipEntries.forEach(entry => {
        const entryPathParts = entry.entryName.split('/');
        if (entryPathParts.length === 2 && entryPathParts[1] === 'package.json') {
          packageJson = entry.getData().toString('utf8');
        }
      });
      if (packageJson == null) {
        return res.status(400).json({ error: 'Invalid package creation request: No package.json found in zip' });
      } else {
        packageJsonContent = JSON.parse(packageJson);
        log.info("repo url:", packageJsonContent?.repository?.url, "name:", packageJsonContent.name, "version:", packageJsonContent.version);
        // Check for repository url, name, and version in package.json
        if (!packageJsonContent?.repository?.url || !packageJsonContent.name || !packageJsonContent.version) {
          return res.status(400).json({ error: 'Invalid package creation request: package.json must contain repository url, package name, and version' });
        }
      }

      // If valid, generate package ID from name and version
      id = generatePackageId(packageJsonContent.name, packageJsonContent.version);
      // Update package info (no need to rate uploaded package at this point)
      info = {
        ID: id,
        NAME: packageJsonContent.name,
        VERSION: packageJsonContent.version,
        URL: packageJsonContent?.repository?.url,
        NET_SCORE: 0,
        RAMP_UP_SCORE: 0,
        CORRECTNESS_SCORE: 0,
        BUS_FACTOR_SCORE: 0,
        RESPONSIVE_MAINTAINER_SCORE: 0,
        LICENSE_SCORE: 0,
        PULL_REQUESTS_SCORE: 0,
        PINNED_DEPENDENCIES_SCORE: 0,
      };

      // Upload package content to S3 bucket and make reference in database
      const s3params = {
        Bucket: "pckstore",
        Key: "packages/" + id + ".zip",
        Body: zipBuffer,
      };
      await s3client.send(new PutObjectCommand(s3params))
        .then((response: { $metadata: unknown; }) => {
          log.info("PutObject succeeded, uploaded to S3:", response.$metadata);
        })
        .catch((error: unknown) => {
          log.error("Error storing object to S3:", error);
          throw(error);
        });
    } else if (packageData?.URL) {
      log.info("createPackage request via public ingest:", packageData.URL);
      info = await metricCalcFromUrl(packageData.URL);
      log.info("ingest via URL info:", info);
      if (info == null) {
        return res.status(400).json({ error: 'Invalid package creation request: Could not get GitHub url' });
      // } else if (info.NET_SCORE < 0.5) {
      } else if (info.NET_SCORE < 0.4) {
        return res.status(424).json({ error: 'Invalid package creation request: Package can not be uploaded due to disqualifying rating.' });
      }
      // If valid, generate package ID from name and version
      id = generatePackageId(info.NAME, info.VERSION);
      info.ID = id;
    } else {
      return res.status(400).json({ error: 'Invalid package creation request: Bad set of Content and URL' });
    }
    log.info("new package's id:", info);
    // set s3path with package id
    s3path = "https://pckstore.s3.amazonaws.com" + "/packages/" + id + ".zip";

    // Check if package exists already
    const existsParams = {
      TableName: "packages",
      Key: {
        id: { N: id },
      },
    };
    let exists: boolean = false;
    const existsCommand = new GetItemCommand(existsParams);
    await dbclient.send(existsCommand)
      .then((response) => {
        log.info("GetItem for exists check succeeded:", response.$metadata);
        if (response.Item) {
          exists = true;
        }
      })
      .catch((error) => {
        log.error("Error checking for existence:", error);
        throw(error);
      });
    if (exists) {
      return res.status(409).json({ error: 'Invalid package creation request: Package already exists' });
    }

    // Create the package
    const params: PutItemCommandInput = {
      TableName: "packages",
      Item: {
        id: { N: id },
        name: { S: info.NAME },
        version: { S: info.VERSION },
        s3path: { S: s3path },
        Value: { S: JSON.stringify(info) },
      },
    };

    const command = new PutItemCommand(params);
    await dbclient.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });

    // Respond with a success message and the created package data
    const createdPackage = [
    {
      "metadata": {
        "Name": info.NAME,
        "Version": info.VERSION,
        "ID": id
      },
      "data": {
        "Content": "",
        // "JSProgram": "if (process.argv.length === 7) {\nconsole.log('Success')\nprocess.exit(0)\n} else {\nconsole.log('Failed')\nprocess.exit(1)\n}\n"
      }
    }];
    res.status(201).json(createdPackage);
  } catch (error) {
    log.error('Error handling POST /package:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}
