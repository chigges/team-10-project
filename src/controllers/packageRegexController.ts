import { Request, Response } from 'express';
import { AuthenticationToken, PackageMetadata, PackageRegEx } from '../types'; 

// Controller function for handling the GET request to /package/byName/{name}
export const postPackageByRegEx = (req: Request, res: Response) => {
  try {
    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    //ADD LOGIC TO GET THE PACKAGES FROM THE REGEX THAT IS INPUTED

    const packageHistory: PackageMetadata[] = [
        {
          "Version": "1.2.3",
          "Name": "Underscore"
        },
        {
          "Version": "1.2.3-2.1.0",
          "Name": "Lodash"
        },
        {
          "Version": "^1.2.3",
          "Name": "React"
        }
      ];

    // Respond with the package history entries
    res.status(200).json(packageHistory);
  } catch (error) {
    console.error('Error handling /package/byName/{name}:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};
