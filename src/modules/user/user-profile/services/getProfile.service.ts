import { fetchActiveProfile } from "../helpers/fetchActiveProfile.helper.js";

export async function getProfileService(userId: string) {
  return await fetchActiveProfile(userId);
}
