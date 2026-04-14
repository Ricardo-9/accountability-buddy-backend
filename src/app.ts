import express from "express";
import { rateLimiter } from "./middlewares/generalRateLimit.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { testRoutes } from "./core/tests/routes.js";
import { healthRouter } from "./core/http/health.routes.js";
import { userProfileRoutes } from "./modules/user/user-profile/routes.js";
import { userAuthRoutes } from "./modules/user/auth/routes.js";
import { userAreasRoutes } from "./modules/user/areas/routes.js";
import { financialRoutes } from "./modules/finance/routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();

app.use(express.json());

app.use(rateLimiter);

app.use(testRoutes);
app.use(healthRouter);


// User routes
app.use("/user", userProfileRoutes, userAuthRoutes, userAreasRoutes);

// Finance routes
app.use("/finance", financialRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
