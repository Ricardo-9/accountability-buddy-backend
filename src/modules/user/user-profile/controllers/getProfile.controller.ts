import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { getProfileService } from "../services/getProfile.service.js";
export async function getProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;

  try {
    const profile = await getProfileService(userId);

    return successResponse(res, { profile: profile });
  } catch (err) {
    next(err);
  }
}
