import { Request, Response, NextFunction } from "express";
import { signinService } from "../services/signin.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function signinController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const { user, session } = await signinService(email, password);

    return successResponse(res, {
      id: user.id,
      email: user.email,
      accessToken: session.access_token,
    });
  } catch (err) {
    next(err);
  }
}
