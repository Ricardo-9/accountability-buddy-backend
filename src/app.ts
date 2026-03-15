import express from "express";
import { healthRouter } from "./core/http/health.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { authRoutes } from "./modules/user/auth/routes.js";
import { rateLimiter } from "./middlewares/generalRateLimit.js";
import { testRoutes } from "./core/tests/routes.js";

const app = express();

app.use(express.json());

app.use(testRoutes);

// Routes (app.use("/route", routes))
app.use("/auth", authRoutes);

app.use(healthRouter);

app.use(rateLimiter);

app.use(errorHandler);

export default app;
