import rateLimit from "express-rate-limit";
import { AppError } from "../../../../core/errors/AppError.js";

export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests:true,
  handler: (_req, _res, next) => {
    throw new AppError(
      "TOO_MANY_REQUESTS",
      "Too many requests, try again later",
      429,
    );
  },
});
