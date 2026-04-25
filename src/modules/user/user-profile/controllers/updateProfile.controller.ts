import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { updateProfileService } from "../services/updateProfile.service.js";

export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const data = req.body;

  try {
    const updatedProfile = await updateProfileService(userId, data);

    return successResponse(
      res,
      { profile: updatedProfile },
      "User profile sucessfully updated",
    );
  } catch (err) {
    next(err);
  }
}
