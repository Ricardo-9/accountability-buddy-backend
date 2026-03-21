import { UpdateProfile } from "../schemas/updateProfile.schema.js";
import { handleUserProfileError } from "../utils/handleUserProfileError.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { UserProfile } from "@prisma/client";
import { userProfileRepository } from "../repositories/userProfile.repository.js";

async function fetchActiveProfile(userId: string): Promise<UserProfile> {
  const profile = await userProfileRepository.findById(userId);

  if (!profile || profile.deletedAt || profile.status === "DELETED") {
    throw new AppError("NOT_FOUND", "Profile not found", 404);
  }

  return profile;
}

export const userProfileServices = {
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      return await fetchActiveProfile(userId);
    } catch (err) {
      handleUserProfileError(err);
    }
  },

  async updateProfile(
    userId: string,
    data: UpdateProfile,
  ): Promise<UserProfile> {
    try {
      await fetchActiveProfile(userId);
      return await userProfileRepository.update(userId, data);
    } catch (err) {
      handleUserProfileError(err);
    }
  },

  async deleteProfile(userId: string): Promise<void> {
    try {
      await fetchActiveProfile(userId);
      await userProfileRepository.delete(userId);
    } catch (err) {
      handleUserProfileError(err);
    }
  },
};
