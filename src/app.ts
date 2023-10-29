import express from 'express';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON request bodies

app.use('/', routes); // Use your defined routes

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
