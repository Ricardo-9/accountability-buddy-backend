import { fetchActiveProfile } from "../helpers/fetchActiveProfile.helper.js";
import { userProfileRepository } from "../repositories/userProfile.repository.js";
import { UpdateProfileBodyType } from "../schemas/updateProfile.schema.js";

export async function updateProfileService(
  userId: string,
  data: UpdateProfileBodyType,
) {
  await fetchActiveProfile(userId);
  return await userProfileRepository.update(userId, data);
}
