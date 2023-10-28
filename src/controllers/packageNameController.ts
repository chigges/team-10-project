import { Request, Response } from 'express';
import { AuthenticationToken, PackageHistoryEntry, PackageName } from '../types'; 

// Controller function for handling the GET request to /package/byName/{name}
export const getPackageHistoryByName = (req: Request, res: Response) => {
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
    const packageName: string = req.params.name;
    // Implement the logic to fetch package history entries by the package name

    const packageHistory: PackageHistoryEntry[] = [
      // Example package history entries
      {
        User: {
          name: 'James Davis',
          isAdmin: true,
        },
        Date: '2023-03-23T23:11:15Z',
        PackageMetadata: {
          Name: 'Underscore',
          Version: '1.0.0',
          ID: 'underscore',
        },
        Action: 'DOWNLOAD',
      },
      // Add more history entries as needed
    ];

    // Respond with the package history entries
    res.status(200).json(packageHistory);
  } catch (error) {
    console.error('Error handling /package/byName/{name}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

// Controller function for handling the DELETE request to /package/byName/{name}
export const deletePackageByName = (req: Request, res: Response) => {
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

    // Implement the logic to delete all versions of the package by name
    // This could involve deleting records or files associated with the package

    // Respond with a success message
    res.status(200).json({ message: 'Package is deleted' });
  } catch (error) {
    console.error('Error handling /package/byName/{name}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};

