import { fetchActiveProfile } from "../helpers/fetchActiveProfile.helper.js";
import { userProfileRepository } from "../repositories/userProfile.repository.js";

export async function deleteProfileService(userId: string) {
  await fetchActiveProfile(userId);
  return await userProfileRepository.delete(userId);
}
