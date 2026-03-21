import express from "express";
import { healthRouter } from "./core/http/health.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { rateLimiter } from "./middlewares/generalRateLimit.js";
import { testRoutes } from "./core/tests/routes.js";
import { userProfileRoutes } from "./modules/user/user-profile/routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";
import { userRoutes } from "./modules/user/routes.js";
import { financialRoutes } from "./modules/finance/routes.js";

const app = express();

app.use(express.json());

app.use(rateLimiter);

app.use(testRoutes);

// User profile routes
app.use("/user", userProfileRoutes);

app.use("/user",userRoutes)

app.use("/finance", financialRoutes)

app.use(healthRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
