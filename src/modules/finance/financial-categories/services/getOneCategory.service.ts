
import { fetchCategory } from "../helpers/fetchCategory.helper.js";

export async function getOneCategoryService(userId: string, id: string) {
  return fetchCategory(userId,id)
}
