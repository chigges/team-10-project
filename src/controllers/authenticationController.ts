/*
 * File: authenticationController.ts
 * Author: Madi Arnold
 * Description: The /authenticate endpoint, however we are not implementing this endpoint
 */


import { Request, Response } from 'express';

// Controller function for handling the PUT request to /authenticate
export const createAuthToken = (req: Request, res: Response) => {
  return res.status(501).json({ error: 'We do not support authentication' });
};

