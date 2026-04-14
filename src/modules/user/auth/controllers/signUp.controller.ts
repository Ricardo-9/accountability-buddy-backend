import { signUpService } from "../services/signUp.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { Request, Response, NextFunction } from "express";

export async function signUpController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { email, password } = req.body;

    const user = await signUpService(email, password);

    return successResponse(
      res,
      {
        id: user.id,
        email: user.email,
      },
      undefined,
      201,
    );
  } catch (err) {
    next(err);
  }
}
