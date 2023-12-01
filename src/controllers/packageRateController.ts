import { Request, Response } from 'express';
import { PackageRating, AuthenticationToken, PackageId, PackageHistoryEntry, PackageMetadata, PackageName } from '../types'; // Adjust the path as needed
import { log } from '../logger';
import { metricCalcFromUrl, PackageInfo, dbclient, timeout, defaultUser } from './controllerHelpers';
import { GetItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

// Controller function for handling the GET request to /package/{id}/rate
export async function getPackageRating(req: Request, res: Response) {
  try {
    const packageId: PackageId = req.params.id; // Extract the package ID from the URL
    let packageName: PackageName = "";
    let packageVersion: string = "";

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to access the package rating (you can add more logic here)

    // Fetch the package rating based on the provided ID
    // Get repo url from DB entry
    let packageURL = "";
    const params = {
      TableName: "packages",
      Key: {
        id: { N: packageId },
      },
    };

    await dbclient.send(new GetItemCommand(params))
      .then((response) => {
        if (response.Item) {
          packageURL = response.Item.repoURL.S || "";
          packageName = response.Item.name.S || "";
          packageVersion = response.Item.version.S || "";
        }
      })
      .catch((error) => {
        log.error("Error fetching package URL from DB:", error)
      });

    if (packageURL === "") {
      return res.status(404).json({ error: 'Package not found' });
    }

    // Rate package, time out after 40 seconds
    log.info("Rating package with ID:", packageId, "...");
    const timeoutPromise = timeout(40000);
    const infoPromise = metricCalcFromUrl(packageURL);
    const result = await Promise.race([timeoutPromise, infoPromise]);
    if (result === undefined) {
      return res.status(500).json({ error: 'The package rating system choked on at least one of the metrics' });
    } else if (result === null) {
      return res.status(500).json({ error: 'The package rating system failed to rate the package' });
    }
    const info = result as PackageInfo;

    // Append new history entry to current history
    const date = new Date();
    const isoDate = date.toISOString();
    // Package metadata
    const metadata: PackageMetadata = {
      ID: packageId,
      Name: packageName,
      Version: packageVersion,
    };
    // Create package history entry
    const history: PackageHistoryEntry = {
      Action: "RATE",
      Date: isoDate,
      PackageMetadata: metadata,
      User: defaultUser,
    };
    // Append to current history
    const appendHistoryParams = {
      TableName: "packageHistory",
      Key: {
        name: { S: packageName },
      },
      UpdateExpression: `SET #attrName = list_append(if_not_exists(#attrName, :empty_list), :newData)`,
      ExpressionAttributeNames: {
        '#attrName': "history",
      },
      ExpressionAttributeValues: {
        ':empty_list': { L: [] },
        ':newData': { L: [{ S: JSON.stringify(history) }] },
      },
    };
    await dbclient.send(new UpdateItemCommand(appendHistoryParams))
      .then(() => {
        log.info("Successfully appended history entry to package:", packageName);
      })
      .catch((error) => {
        log.error("Error appending history entry to package:", packageName, error);
      });

    // Respond with the package rating
    const packageRating: PackageRating = {
      "BusFactor": info.BUS_FACTOR_SCORE,
      "Correctness": info.CORRECTNESS_SCORE,
      "RampUp": info.RAMP_UP_SCORE,
      "ResponsiveMaintainer": info.RESPONSIVE_MAINTAINER_SCORE,
      "LicenseScore": info.LICENSE_SCORE,
      "GoodPinningPractice": info.PINNED_DEPENDENCIES_SCORE,
      "PullRequest": info.PULL_REQUESTS_SCORE,
      "NetScore": info.NET_SCORE,
    };
    res.status(200).json(packageRating);
  } catch (error) {
    console.error('Error handling /package/{id}/rate:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
}
