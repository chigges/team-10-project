import { Request, Response } from 'express';
import { AuthenticationToken } from '../types';
import { DynamoDBClient, DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, ListObjectsCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });
const s3 = new S3Client({ region: 'us-east-1' });

// Controller function for handling the DELETE request to /reset
export const resetRegistry = async (req: Request, res: Response) => {
  try {
    console.log('Handling /reset request');

    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      console.error('Authentication token missing or invalid');
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    console.log('Authentication token:', authorizationHeader);

    // Perform the registry reset
    // Delete all items from DynamoDB table
    await deleteAllItemsFromDynamoDB('packages');
    await deleteAllItemsFromDynamoDB('packageHistory');

    console.log('DynamoDB items deleted successfully');

    // Delete all objects from S3 bucket
    // Uncomment the line below once the issue with S3 bucket access is resolved
    await deleteAllObjectsFromS3Bucket('pckstore');

    console.log('S3 objects deleted successfully');

    // Respond with a success message
    res.status(200).json({ message: 'Registry reset successfully' });
  } catch (error) {
    console.error('Error handling /reset:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

async function deleteAllItemsFromDynamoDB(tableName: string): Promise<void> {
  try {
    console.log(`Deleting all items from DynamoDB table: ${tableName}`);
    const scanParams = {
      TableName: tableName,
    };

    const scanResult = await dynamoDb.send(new ScanCommand(scanParams));

    if (scanResult.Items) {
      // Delete each item from DynamoDB (hard-coded if/else since keys differ)
      const deletePromises = scanResult.Items.map((item) => {
        if (tableName === 'packages') {
          const deleteParams = {
            TableName: tableName,
            Key: {
              id: item.id,
            },
          };
          return dynamoDb.send(new DeleteItemCommand(deleteParams));
        } else if (tableName === 'packaeHistory') {
          const deleteParams = {
            TableName: tableName,
            Key: {
              name: item.name,
            },
          };
          return dynamoDb.send(new DeleteItemCommand(deleteParams));
        }
      });

      await Promise.all(deletePromises);
      console.log(`All items deleted from DynamoDB table: ${tableName}`);
    } else {
      console.log(`No items found in DynamoDB table: ${tableName}`);
    }
  } catch (error) {
    console.error('Error deleting items from DynamoDB:', error);
    throw error;
  }
}

async function deleteAllObjectsFromS3Bucket(bucketName: string): Promise<void> {
  try {
    console.log(`Deleting all objects from S3 bucket: ${bucketName}`);
    const listParams = {
      Bucket: bucketName,
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
      console.log(`All objects deleted from S3 bucket: ${bucketName}`);
    } else {
      console.log(`No objects found in S3 bucket: ${bucketName}`);
    }
  } catch (error) {
    console.error('Error deleting objects from S3 bucket:', error);
    throw error;
  }
}
