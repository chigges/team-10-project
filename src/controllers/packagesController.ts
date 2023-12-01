/*
 * File: packagesController.ts
 * Author: Madi Arnold
 * Description: The /packages endpoint logic
 */

import { DynamoDBClient, QueryCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { Request, Response } from 'express';
import { PackageQuery, EnumerateOffset, PackageMetadata, AuthenticationToken } from '../types'; // Adjust the path as needed
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

// Controller function for handling the POST request to /packages
export const getPackages = async (req: Request, res: Response) => {
  try {
    console.log('POST /packages endpoint');

    // Validate request body
    const packageQueries: PackageQuery[] = req.body;

    if (!packageQueries || packageQueries.length === 0) {
      return res.status(400).json({ error: 'PackageQuery array must not be empty.' });
    }

    // Verify the X-Authorization header for authentication and permission
    const authToken: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authToken || !isValidAuthToken(authToken)) {
      return res.status(400).json({ error: 'Invalid or missing authentication token.' });
    }

    // Parse query parameters safely
    let offset: EnumerateOffset | undefined;

    if (req.query.offset) {
      const rawOffset = req.query.offset as string;

      // Check if rawOffset is a valid number
      if (!isNaN(parseInt(rawOffset, 10))) {
        offset = rawOffset;
      } else {
        return res.status(400).json({ error: 'Invalid offset value.' });
      }
    }

    res.header('offset', offset?.toString());

    const results = await Promise.all(
      packageQueries.map(async ({ Name, Version }) => {
        if (!Name) {
          return res.status(400).json({ error: 'PackageQuery must have a Name field.' });
        }

        if (Name === '*') {
          // Handle the case where Name is "*"
          const allPackagesResult = await dynamoDb.send(new ScanCommand({
            TableName: 'packages', // Replace with your DynamoDB table name
            // Any additional conditions or parameters as needed
            ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
          }));

          // Convert DynamoDB items to PackageMetadata
          const allPackages: PackageMetadata[] = allPackagesResult.Items
            ? allPackagesResult.Items.map((item) => {
              const unmarshalledItem = unmarshall(item);
              const valueObject = unmarshalledItem.value || {};
              return {
                ID: valueObject.ID,
                Name: unmarshalledItem.name,
                Version: unmarshalledItem.version,
              };
            })
            : [];
          console.log('All Packages:', allPackages);
          return allPackages;
        } else {
          // Handle the case where Name is not "*"
          let filteredPackages: PackageMetadata[] = [];

          if (!Version) {
            const params = {
              TableName: 'packages', // Replace with your DynamoDB table name
              FilterExpression: '#n = :name' + (Version ? ' AND #v = :version' : ''),
              ExpressionAttributeNames: {
                '#n': 'name', // Attribute name for 'Name'
                ...(Version ? { '#v': 'version' } : {}), // Add 'Version' attribute name if a version is provided
              },
              ExpressionAttributeValues: marshall({
                ':name': Name,
                ...(Version ? { ':version': Version } : {}),
              }),
              ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
            };
            const result = await dynamoDb.send(new ScanCommand(params));
            // Convert DynamoDB items to PackageMetadata
            console.log('Result', result);
            filteredPackages = result.Items
              ? result.Items.map((item) => {
                const unmarshalledItem = unmarshall(item);
                const valueObject = unmarshalledItem.value || {};
                return {
                  ID: valueObject.ID,
                  Name: unmarshalledItem.name,
                  Version: unmarshalledItem.version,
                };
              })
              : [];
          } else {
            const exactMatch = /^(\d+\.\d+\.\d+)$/.exec(Version);
            const boundedRange = /^(\d+\.\d+\.\d+)-(\d+\.\d+\.\d+)$/.exec(Version);
            const caratRange = /^\^(\d+\.\d+\.\d+)$/.exec(Version);
            const tildeRange = /^~(\d+\.\d+\.(\d+))$/.exec(Version);

            if (exactMatch) {
              const params = {
                TableName: 'packages', // Replace with your DynamoDB table name
                FilterExpression: '#n = :name' + (Version ? ' AND #v = :version' : ''),
                ExpressionAttributeNames: {
                  '#n': 'name', // Attribute name for 'Name'
                  ...(Version ? { '#v': 'version' } : {}), // Add 'Version' attribute name if a version is provided
                },
                ExpressionAttributeValues: marshall({
                  ':name': Name,
                  ...(Version ? { ':version': Version } : {}),
                }),
                ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
              };
              const result = await dynamoDb.send(new ScanCommand(params));
              // Convert DynamoDB items to PackageMetadata
              console.log('Result', result);
              filteredPackages = result.Items
                ? result.Items.map((item) => {
                  const unmarshalledItem = unmarshall(item);
                  const valueObject = unmarshalledItem.value || {};
                  return {
                    ID: valueObject.ID,
                    Name: unmarshalledItem.name,
                    Version: unmarshalledItem.version,
                  };
                })
                : [];
            } else if (boundedRange) {
              const params = {
                TableName: 'packages', // Replace with your DynamoDB table name
                FilterExpression: '#n = :name' + (Version ? ' AND #v BETWEEN :startVersion AND :endVersion' : ''),
                ExpressionAttributeNames: {
                  '#n': 'name', // Attribute name for 'Name'
                  ...(Version ? { '#v': 'version' } : {}), // Add 'Version' attribute name if a version is provided
                },
                ExpressionAttributeValues: marshall({
                  ':name': Name,
                  ...(Version ? { ':startVersion': boundedRange[1], ':endVersion': boundedRange[2] } : {}),
                }),
                ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
              };
              const result = await dynamoDb.send(new ScanCommand(params));
              // Convert DynamoDB items to PackageMetadata
              console.log('Result', result);
              filteredPackages = result.Items
                ? result.Items.map((item) => {
                  const unmarshalledItem = unmarshall(item);
                  const valueObject = unmarshalledItem.value || {};
                  return {
                    ID: valueObject.ID,
                    Name: unmarshalledItem.name,
                    Version: unmarshalledItem.version,
                  };
                })
                : [];
            } else if (caratRange) {
              const caretMatch = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(Version);
              const [major, minor, patch] = (caretMatch || []).slice(1).map(Number)
              const startVersion = `${major}.${minor}.${patch}`
              const endVersion = `${major + 1}.0.0`
              const params = {
                TableName: 'packages', // Replace with your DynamoDB table name
                FilterExpression: '#n = :name' + (Version ? ' AND #v >= :startVersion AND #v < :endVersion' : ''),
                ExpressionAttributeNames: {
                  '#n': 'name', // Attribute name for 'Name'
                  ...(Version ? { '#v': 'version' } : {}), // Add 'Version' attribute name if a version is provided
                },
                ExpressionAttributeValues: marshall({
                  ':name': Name,
                  ...(Version ? { ':startVersion': startVersion, ':endVersion': endVersion } : {}),
                }),
                ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
              };
              const result = await dynamoDb.send(new ScanCommand(params));
              // Convert DynamoDB items to PackageMetadata
              console.log('Result', result);
              filteredPackages = result.Items
                ? result.Items.map((item) => {
                  const unmarshalledItem = unmarshall(item);
                  const valueObject = unmarshalledItem.value || {};
                  return {
                    ID: valueObject.ID,
                    Name: unmarshalledItem.name,
                    Version: unmarshalledItem.version,
                  };
                })
                : [];
            } else if (tildeRange) {
              const tildeMatch = /^\~(\d+)\.(\d+)\.(\d+)$/.exec(Version);
              const [major, minor, patch] = (tildeMatch || []).slice(1).map(Number)
              const startVersion = `${major}.${minor}.${patch}`
              const endVersion = `${major}.${(minor + 1)}.0`
              const params = {
                TableName: 'packages', // Replace with your DynamoDB table name
                FilterExpression: '#n = :name' + (Version ? ' AND #v >= :startVersion AND #v < :endVersion' : ''),
                ExpressionAttributeNames: {
                  '#n': 'name', // Attribute name for 'Name'
                  ...(Version ? { '#v': 'version' } : {}), // Add 'Version' attribute name if a version is provided
                },
                ExpressionAttributeValues: marshall({
                  ':name': Name,
                  ...(Version ? { ':startVersion': startVersion, ':endVersion': endVersion } : {}),
                }),
                ExclusiveStartKey: offset ? unmarshall(JSON.parse(Buffer.from(offset, 'base64').toString())) : undefined,
              };
              const result = await dynamoDb.send(new ScanCommand(params));
              // Convert DynamoDB items to PackageMetadata
              console.log('Result', result);
              filteredPackages = result.Items
                ? result.Items.map((item) => {
                  const unmarshalledItem = unmarshall(item);
                  const valueObject = unmarshalledItem.value || {};
                  return {
                    ID: valueObject.ID,
                    Name: unmarshalledItem.name,
                    Version: unmarshalledItem.version,
                  };
                })
                : [];
            } else {
              res.status(400).json({ error: 'Incorrect Version Format' });
            }
          }

          console.log('Filtered Packages:', filteredPackages);
          return filteredPackages;
        }
      })
    );

    // Flatten the array of arrays into a single array
    const allPackages = results.flat();

    res.status(200).json(allPackages); // Send a JSON response with the filtered packages
  } catch (error) {
    console.error('Error handling /packages:', error);
    res.status(413).json({ error: 'Internal Server Error' }); // Handle any errors with a 500 status
  }
};

// Example function to validate the authentication token (replace with your logic)
function isValidAuthToken(token: AuthenticationToken): boolean {
  // Add your authentication token validation logic here
  // For simplicity, this example assumes any non-empty token is valid
  return !!token;
}