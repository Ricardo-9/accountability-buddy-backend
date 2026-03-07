import express from 'express';
import { healthRouter } from './core/http/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

// Routes (app.use("/route", routes))
app.use(healthRouter)

app.use(errorHandler)

export default app;