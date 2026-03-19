import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { userProfileServices } from "../services/userProfile.service.js";
import { Request, Response, NextFunction } from "express";

export const userProfileControllers = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userProfileServices.getProfile(req.user!.id);
      return successResponse(res, profile);
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await userProfileServices.updateProfile(
        req.user!.id,
        req.body,
      );
      return successResponse(res, profile, "Profile updated");
    } catch (err) {
      next(err);
    }
  },

  async deleteProfile(req: Request, res: Response, next: NextFunction) {
    try {
      await userProfileServices.deleteProfile(req.user!.id);
      return successResponse(res, null, "Profile deleted");
    } catch (err) {
      next(err);
    }
  },
};
