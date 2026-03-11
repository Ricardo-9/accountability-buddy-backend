import { signupService } from "../services/signup.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { Request, Response, NextFunction } from "express";

export async function signupController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await signupService(email, password);

    return successResponse(res, {
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
}
