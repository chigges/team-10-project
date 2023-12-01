/*
 * File: app.ts
 * Author: Madi Arnold
 * Description: The main file for our backend that gets up the port and enables CORS for all routes 
 */

import express from 'express';
import routes from './routes';

const app = express();
const port = process.env.PORT || 9000;
const cors = require('cors');

app.use(express.json({ limit: '50mb' })); // Middleware to parse JSON request bodies

app.use(cors());

// Enable CORS for all routes
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(express.json()); // Middleware to parse JSON request bodies
app.use('/', routes); // Use your defined routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
