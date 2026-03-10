import rateLimit from "express-rate-limit";
import { AppError } from "../core/errors/AppError.js";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, _res, _next) => {
    throw new AppError(
      "TOO_MANY_REQUESTS",
      "Too many requests, try again later",
      429,
    );
  },
});
