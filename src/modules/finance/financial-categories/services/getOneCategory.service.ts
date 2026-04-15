import { AppError } from "../../../../core/errors/AppError.js";
import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function getOneCategoryService(userId: string, id: string) {
  const category = await financialCategoriesRepository.findOneById(
      userId,
      id,
    );
  
    if (!category) {
      throw new AppError("NOT_FOUND", "category not found", 404);
    }
  
    return category;
}
