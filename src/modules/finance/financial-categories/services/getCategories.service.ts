import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function getCategories(userId: string, limit = 10, cursor?: string) {
  
  return financialCategoriesRepository.findManyById(userId,limit,cursor);
}
