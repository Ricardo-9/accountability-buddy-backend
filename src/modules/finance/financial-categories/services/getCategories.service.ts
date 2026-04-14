import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function getCategories(userId: string) {
  return financialCategoriesRepository.findManyById(userId);
}
