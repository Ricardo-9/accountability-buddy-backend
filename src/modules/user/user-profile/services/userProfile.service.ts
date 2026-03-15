import { AppError } from "../../../../core/errors/AppError.js";
import { userProfileRepository } from "../repository/userProfile.repository.js";
import { UpdateProfile } from "../schemas/updateProfile.schema.js";

export const userProfileServices = {
  async getProfile(userId: string) {
    const profile = await userProfileRepository.findById(userId);
    if (!profile) {
      throw new AppError("NOT_FOUND", "Profile not found", 404);
    }
    return profile;
  },

  async updateProfile(userId: string, data: UpdateProfile) {
    const existing = await userProfileRepository.findById(userId);
    if (!existing) {
      throw new AppError("NOT_FOUND", "Profile not found", 404);
    }
    const profile = await userProfileRepository.update(userId, data);
    return profile;
  },

  async deleteProfile(userId: string) {
    const existing = await userProfileRepository.findById(userId);
    if (!existing) {
      throw new AppError("NOT_FOUND", "Profile not found", 404);
    }
    return userProfileRepository.delete(userId);
  },

};
