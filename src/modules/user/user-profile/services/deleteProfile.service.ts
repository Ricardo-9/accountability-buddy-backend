import { AppError } from "../../../../core/errors/AppError.js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin.js";
import { fetchActiveProfile } from "../helpers/fetchActiveProfile.helper.js";
import { userProfileRepository } from "../repositories/userProfile.repository.js";

export async function deleteProfileService(userId: string) {
  await fetchActiveProfile(userId);

  const deletedProfile = await userProfileRepository.softDelete(userId);

  try {
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: "876000h" },
    );

    if (banError) {
      await userProfileRepository.reactivate(userId);

      throw new AppError(
        "DELETE_ERROR",
        "Failed to deactivate account in authentication system",
        502,
      );
    }

    return deletedProfile;
  } catch (error) {
    if (!(error instanceof AppError && error.code === "DELETE_ERROR")) {
      await userProfileRepository.reactivate(userId);
    }
    throw error;
  }
}
