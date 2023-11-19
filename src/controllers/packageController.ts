import { Request, Response } from 'express';
import { Package, AuthenticationToken, PackageId, PackageName, PackageData } from '../types';
import { log } from '../logger';
import { DynamoDBClient, PutItemCommand, GetItemCommand, PutItemCommandInput, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generatePackageId, metricCalcFromUrl, PackageInfo } from './controllerHelpers';

const client = new DynamoDBClient({ region: "us-east-1" });

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

    // Retrieve the package with the specified ID from your data source (e.g., a database)
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
      },
    };

    let package1: Package | undefined = undefined;

    const command = new GetItemCommand(params);
    await client.send(command)
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
    await client.send(command)
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
    await client.send(command)
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
    log.info("new package's id:", info);

    // Check if package exists already
    const existsParams = {
      TableName: "packages",
      Key: {
        id: { N: id },
      },
    };
    let exists: boolean = false;
    const existsCommand = new GetItemCommand(existsParams);
    await client.send(existsCommand)
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
        Value: { S: JSON.stringify(info) },
      },
    };

    const command = new PutItemCommand(params);
    await client.send(command)
      .then((response) => {
        log.info("GetItem succeeded:", response.$metadata);
      })
      .catch((error) => {
        log.error("Error getting item:", error);
        throw(error);
      });

    // TODO: upload package content to S3 bucket and make reference in database

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
