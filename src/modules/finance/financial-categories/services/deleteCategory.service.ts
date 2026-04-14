import { fetchCategory } from "../helpers/fetchCategory.helper.js";
import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function deleteCategory(userId: string, categoryId: string) {
  await fetchCategory(userId, categoryId);
  await financialCategoriesRepository.delete(userId, categoryId);
}
