import { AppError } from "../../../../core/errors/AppError.js";
import { userProfileRepository } from "../repositories/userProfile.repository.js";

export async function fetchActiveProfile(userId: string) {
  const profile = await userProfileRepository.findById(userId);

  if (!profile) {
    throw new AppError("NOT_FOUND", "Profile not found", 404);
  }

  return profile;
}
