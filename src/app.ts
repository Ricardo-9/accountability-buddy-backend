import express from 'express';
import { healthRouter } from './core/http/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { userRoutes } from './modules/user/routes.js';

const app = express();

app.use(express.json());

// Routes (app.use("/route", routes))
app.use("/user", userRoutes)
app.use(healthRouter)

app.use(errorHandler)

export default app;