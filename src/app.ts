import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes (app.use("/route", routes))

app.use(errorHandler)

export default app;