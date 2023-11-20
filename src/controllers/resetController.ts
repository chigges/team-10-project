import { Request, Response } from 'express';
import { AuthenticationToken } from '../types'; // Adjust the path as needed
import { DynamoDBClient, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });
const s3 = new S3Client({ region: 'us-east-1' });

// Controller function for handling the DELETE request to /reset
export const resetRegistry = async (req: Request, res: Response) => {
  try {
    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Perform the registry reset
    // Delete all items from DynamoDB table
    await deleteAllItemsFromDynamoDB('packages');

    // Delete all objects from S3 bucket
    //await deleteAllObjectsFromS3Bucket('pckstore');
    //CANNOT GET THE S3 BUCKET TO ALLOW ME TO DELETE THE ZIP FILES 

    // Respond with a success message
    res.status(200).json({ message: 'Registry reset successfully' });
  } catch (error) {
    console.error('Error handling /reset:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};


async function deleteAllItemsFromDynamoDB(tableName: string): Promise<void> {
  const scanParams = {
    TableName: tableName,
  };

  const scanResult = await dynamoDb.send(new ScanCommand(scanParams));

  if (scanResult.Items) {
    // Delete each item from DynamoDB
    const deletePromises = scanResult.Items.map((item) => {
      const deleteParams = {
        TableName: tableName,
        Key: {
          id: item.id,
        },
      };
      return dynamoDb.send(new DeleteItemCommand(deleteParams));
    });

    await Promise.all(deletePromises);
  }
}

async function deleteAllObjectsFromS3Bucket(bucketName: string): Promise<void> {
  const listParams = {
    Bucket: bucketName,
    Prefix: 'packages/',
  };

  const listResult = await s3.send(new ListObjectsCommand(listParams));

  if (listResult.Contents) {
    // Delete each object from S3 bucket
    const deletePromises = listResult.Contents.map((object) => {
      const deleteParams = {
        Bucket: bucketName,
        Key: object.Key || '',
      };
      return s3.send(new DeleteObjectCommand(deleteParams));
    });

    await Promise.all(deletePromises);
  }
}