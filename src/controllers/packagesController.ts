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
    const { Name, Version }: PackageQuery = req.body[0];
    console.log('name: %s', Name);
    console.log('version: %s', Version);
    if (!Name) {
      return res.status(400).json({ error: 'PackageQuery must have a Name field.' });
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

    // If Name is "*", fetch all packages without applying KeyConditionExpression
    if (Name === '*') {
      const allPackagesResult = await dynamoDb.send(new ScanCommand({
        TableName: 'packages', // Replace with your DynamoDB table name
        // Any additional conditions or parameters as needed
      }));

      // Convert DynamoDB items to PackageMetadata
      const allPackages: PackageMetadata[] = allPackagesResult.Items
        ? allPackagesResult.Items.map((item) => { const unmarshalledItem = unmarshall(item);
          const valueObject = unmarshalledItem.value || {};
          return {
            ID: valueObject.ID, 
            Name: unmarshalledItem.name,
            Version: unmarshalledItem.version,
          }; })
        : [];
      console.log('All Packages:', allPackages);
      return res.status(200).json(allPackages);
    }

    // Process the query and retrieve the appropriate package data from DynamoDB
    const params = {
      TableName: 'packages', // Replace with your DynamoDB table name
      FilterExpression: '#n = :name' + (Version ? ' AND #v = :version' : ''),
      ExpressionAttributeNames: {
        '#n': 'name',   // Attribute name for 'Name'
        ...(Version ? { '#v': 'version' } : {}),  // Add 'Version' attribute name if a version is provided
      },
      ExpressionAttributeValues: marshall({
        ':name': Name,
        ...(Version ? { ':version': Version } : {}),
      }),
    };
    

    const result = await dynamoDb.send(new ScanCommand(params));
    // Convert DynamoDB items to PackageMetadata
    console.log('Result', result);
    const filteredPackages: PackageMetadata[] = result.Items
      ? result.Items.map((item) => {const unmarshalledItem = unmarshall(item); 
        const valueObject = unmarshalledItem.value || {};
        return {
          ID: valueObject.ID,
          Name: unmarshalledItem.name, 
          Version: unmarshalledItem.version,
        }; })
      : [];
    console.log('Filtered Packages:', filteredPackages);
    res.status(200).json(filteredPackages); // Send a JSON response with the filtered packages
  } catch (error) {
    console.error('Error handling /packages:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors with a 500 status
  }
};

// Example function to validate the authentication token (replace with your logic)
function isValidAuthToken(token: AuthenticationToken): boolean {
  // Add your authentication token validation logic here
  // For simplicity, this example assumes any non-empty token is valid
  return !!token;
}