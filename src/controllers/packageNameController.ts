import { Request, Response } from 'express';
import { AuthenticationToken, PackageHistoryEntry, PackageName } from '../types'; 
import { log } from '../logger';
import { dbclient, s3client } from './controllerHelpers';
import { ScanCommand, DeleteItemCommand, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Controller function for handling the GET request to /package/byName/{name}
export async function getPackageHistoryByName(req: Request, res: Response) {
  try {
    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to access the package history (you can add more logic here)

    // Retrieve the package history entries based on the provided package name
    const packageName: PackageName = req.params?.name;
    if (!packageName) {
      return res.status(400).json({ error: 'Package name missing or invalid' });
    }
    // Fetch entry from packageHistory DB table
    log.debug("Fetching package history for:", packageName);
    const params = {
      TableName: "packageHistory",
      Key: {
        name: { S: packageName },
      },
    };
    const packageHistory: PackageHistoryEntry[] = [];
    await dbclient.send(new GetItemCommand(params))
      .then((response) => {
        if (response.Item) {
          log.info("Found package history for:", packageName);
          if (response.Item.history.L) {
            log.info("Found", response.Item.history.L.length, "package history entries for:", packageName);
            response.Item.history.L.forEach((item) => {
              if (item.S) {
                const itemAsJSON = JSON.parse(item.S);
                const entry: PackageHistoryEntry = {
                  Action: itemAsJSON.Action,
                  Date: itemAsJSON.Date,
                  PackageMetadata: itemAsJSON.PackageMetadata,
                  User: itemAsJSON.User,
                };
                packageHistory.push(entry);
              }
            });
          }
        }
      })
      .catch((error) => {
        log.error("Error fetching package history from DB:", error)
      });

    if (packageHistory.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Respond with the package history entries
    res.status(200).json(packageHistory);
  } catch (error) {
    console.error('Error handling /package/byName/{name}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}

// Controller function for handling the DELETE request to /package/byName/{name}
export async function deletePackageByName(req: Request, res: Response) {
  try {
    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to delete the package (you can add more logic here)

    // Retrieve the package name from the request path
    const packageName: PackageName = req.params.name;

    // Search database for package with matching name and delete entry and S3 content
    const params = {
      TableName: 'packages',
      FilterExpression: '#attrName = :value',
      ExpressionAttributeNames: {
        '#attrName': 'name',
      },
      ExpressionAttributeValues: {
        ':value': { S: packageName },
      },
    };
    log.info("Scanning DB for items with name:", packageName);
    const scanResult = await dbclient.send(new ScanCommand(params));

    if (scanResult.Items && scanResult.Items.length > 0) {
      log.info("Found", scanResult.Items.length, "items with name:", packageName);
      // Delete DB entries
      const dbdeletePromises = scanResult.Items.map((item) => {
        const deleteParams = {
          TableName: 'packages',
          Key: {
            id: item.id,
          },
        };
        const deleteCommand = new DeleteItemCommand(deleteParams);
        return dbclient.send(deleteCommand);
      });

      // Delete S3 content
      const s3deletePromises = scanResult.Items.map((item) => {
        log.info("Deleting S3 content for id:", item.id.N);
        const deleteParams = {
          Bucket: 'pckstore',
          Key: "packages/" + item.id.N + ".zip",
        };
        return s3client.send(new DeleteObjectCommand(deleteParams));
      });

      await Promise.all(dbdeletePromises);
      await Promise.all(s3deletePromises);
    } else {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Delete package history entry
    const deleteParams = {
      TableName: 'packageHistory',
      Key: {
        name: { S: packageName },
      },
    };
    await dbclient.send(new DeleteItemCommand(deleteParams))
      .then(() => {
        log.info("Deleted package history for:", packageName)
      })
      .catch((error) => {
        log.error("Error deleting package history from DB:", error);
      });

    // Respond with a success message
    res.status(200).json({ message: 'Package is deleted' });
  } catch (error) {
    console.error('Error handling /package/byName/{name}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}

