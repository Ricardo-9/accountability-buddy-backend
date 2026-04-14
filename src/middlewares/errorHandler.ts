import { Request, Response, NextFunction } from "express";
import { AppError } from "../core/errors/AppError.js";
import { errorResponse } from "../shared/utils/apiResponse.js";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid data",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  console.error(err);

  return errorResponse(res, "SERVER_ERROR", "Internal server error", 500);
}
