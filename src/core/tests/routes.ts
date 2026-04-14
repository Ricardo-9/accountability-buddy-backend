import { Router } from "express";
import { authLimiter } from "../../modules/user/auth/middlewares/authRateLimit.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import {
  errorResponse,
  successResponse,
} from "../../shared/utils/apiResponse.js";
import { AppError } from "../errors/AppError.js";
import { z } from "zod";

const router = Router();

router.get("/protected-test", authLimiter, authenticate, (_req, res) => {
  return successResponse(res, null, "ONLY_FOR_TESTS", 200);
});

router.post("/error-test", (req, res, next) => {
  if (req.body && req.body.text === "Success") {
    return successResponse(res, null, "ONLY_FOR_TESTS", 200);
  }

  if (req.body && req.body.text === "AppError") {
    return next(
      new AppError("GENERIC_APP_ERROR", "generic AppError (tests)", 400),
    );
  }

  if (req.body && req.body.text === "Error") {
    return next(new Error());
  }

  if (req.body?.text === "ZodError") {
    const schema = z.object({ name: z.string() });
    try {
      schema.parse({ name: 123 });
    } catch (err) {
      return next(err);
    }
  }

  return errorResponse(
    res,
    "INVALID_TEXT_PAYLOAD",
    "Invalid test payload",
    400,
  );
});

export { router as testRoutes };
