import { fetchCategory } from "../helpers/fetchCategory.helper.js";
import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function deleteCategoryService(userId: string, categoryId: string) {
  await fetchCategory(userId, categoryId);
  return await financialCategoriesRepository.delete(userId, categoryId);
}
