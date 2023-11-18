import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { Request, Response } from 'express';
import { PackageQuery, EnumerateOffset, PackageMetadata, AuthenticationToken } from '../types'; // Adjust the path as needed
import { Credentials } from 'aws-sdk';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

// Controller function for handling the POST request to /packages
export const getPackages = async (req: Request, res: Response) => {
  try {

    // Validate request body
    const { Name, Version }: PackageQuery = req.body;
    if (!Name) {
      return res.status(400).json({ error: 'PackageQuery must have a Name field.' });
    }

    // Validate authentication token
    const authToken: AuthenticationToken = req.headers['X-Authorization'] as AuthenticationToken;
    if (!authToken || !isValidAuthToken(authToken)) {
      return res.status(400).json({ error: 'Invalid or missing authentication token.' });
    }

    // Parse query parameters safely
    let offset: EnumerateOffset | undefined;
    if (req.query.offset) {
      offset = req.query.offset as EnumerateOffset;
    }

    // Process the query and retrieve the appropriate package data from DynamoDB
    const params = {
      TableName: 'packages', // Replace with your DynamoDB table name
      // Add more conditions based on your query logic
      KeyConditionExpression: 'Name = :name' + (Version ? ' AND Version = :version' : ''),
      ExpressionAttributeValues: marshall({
        ':name': Name,
        ...(Version ? { ':version': Version} : {}),
      }),
    };

    const result = await dynamoDb.send(new QueryCommand(params));
    // Convert DynamoDB items to PackageMetadata
    const filteredPackages: PackageMetadata[] = result.Items ? result.Items.map((item) => {
      const unmarshalledItem = unmarshall(item);
      return {
        ID: unmarshalledItem.id,
        Name: unmarshalledItem.name,
        Version: unmarshalledItem.version,
      };
    }) : [];

    // Process the query and retrieve the appropriate package data
    // Replace the following with your logic to fetch and filter packages based on the query
    /*const filteredPackages: PackageMetadata[] = [
        {
            "Version": "1.2.3",
            "Name": "Underscore",
            "ID": "underscore"
          },
          {
            "Version": "1.2.3-2.1.0",
            "Name": "Lodash",
            "ID": "lodash"
          },
          {
            "Version": "^1.2.3",
            "Name": "React",
            "ID": "react"
          }
    ]; // Your logic here*/
    
    res.status(200).json(filteredPackages); // Send a JSON response with the filtered packages
  } catch (error) {
    console.error('Error handling /packages:', error);
    res.status(413).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

// Example function to validate the authentication token (replace with your logic)
function isValidAuthToken(token: AuthenticationToken): boolean {
  // Add your authentication token validation logic here
  // For simplicity, this example assumes any non-empty token is valid
  return !!token;
}