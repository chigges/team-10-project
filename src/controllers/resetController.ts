import { Request, Response } from 'express';
import { AuthenticationToken } from '../types'; // Adjust the path as needed

// Controller function for handling the DELETE request to /reset
export const resetRegistry = (req: Request, res: Response) => {
  try {
    // Verify the X-Authorization header for authentication and permission
    const authorizationHeader: AuthenticationToken | undefined = Array.isArray(req.headers['x-authorization'])
      ? req.headers['x-authorization'][0] // Use the first element if it's an array
      : req.headers['x-authorization']; // Use the value directly if it's a string or undefined

    if (!authorizationHeader) {
      return res.status(400).json({ error: 'Authentication token missing or invalid' });
    }

    // Check for permission to reset the registry (you can add more logic here)

    // Perform the registry reset (replace this with your logic)

    // Respond with a success message
    res.status(200).json({ message: 'Registry reset successfully' });
  } catch (error) {
    console.error('Error handling /reset:', error);
    res.status(500).json({ error: 'Internal Server Error' }); // Handle any errors
  }
};
