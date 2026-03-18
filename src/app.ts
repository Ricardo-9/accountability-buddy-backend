import express from 'express';
import { healthRouter } from './core/http/health.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { userRoutes } from './modules/user/routes.js';
import { rateLimiter } from './middlewares/generalRateLimit.js';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';


const app = express();

app.use(express.json());

// Routes (app.use("/route", routes))
app.use("/user", userRoutes)

app.use(healthRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(rateLimiter)

app.use(errorHandler)

export default app;