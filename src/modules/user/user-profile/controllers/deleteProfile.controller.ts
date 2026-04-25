import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { deleteProfileService } from "../services/deleteProfile.service.js";

export async function deleteProfileController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;

  try {
    const deletedProfile = await deleteProfileService(userId);
    return successResponse(
      res,
      { profile: deletedProfile },
      "User profile sucessfully deleted",
    );
  } catch (err) {
    next(err);
  }
}
