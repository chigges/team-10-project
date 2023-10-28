import express from 'express';
import { getPackages } from './controllers/packagesController'; 
import { resetRegistry } from './controllers/resetController';
import { getPackageById } from './controllers/packageController';
import { updatePackage } from './controllers/packageController';
import { deletePackage } from './controllers/packageController';
import { createPackage } from './controllers/packageController';
import { getPackageRating } from './controllers/packageRateController';
import { createAuthToken } from './controllers/authenticationController';
import { getPackageHistoryByName } from './controllers/packageNameController';
import { deletePackageByName } from './controllers/packageNameController';

const router = express.Router();

// Define the route for handling the POST request to /packages
router.post('/packages', getPackages);

// Define the route for handling the DELETE request to /reset
router.delete('/reset', resetRegistry);

//Define the route for handling the GET requeest to /package/{id}
router.get('/package/:id', getPackageById);

// Define the route for handling the PUT request to update a package by ID
router.put('/package/:id', updatePackage);

// Define the route for handling the DELETE request to /package/:id
router.delete('/package/:id', deletePackage);

// Define the route for handling the POST request to /package
router.post('/package', createPackage);

// Define the route for handling the GET request to /package/{id}/rate
router.get('/package/:id/rate', getPackageRating);

// Define the route for handling the PUT request to /authenticate
router.put('/authenticate', createAuthToken);

// Define the route for handling the GET request to /package/byName/{name}
router.get('/package/byName/:name', getPackageHistoryByName);

// Define the route for handling the DELETE request to /package/byName/{name}
router.delete('/package/byName/:name', deletePackageByName);

export default router;
