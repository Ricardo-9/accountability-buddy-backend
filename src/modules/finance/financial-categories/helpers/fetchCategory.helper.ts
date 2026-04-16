
import { AppError } from "../../../../core/errors/AppError.js";
import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";

export async function fetchCategory(userId: string, categoryId: string) {
  const category = await financialCategoriesRepository.findOneById(
    userId,
    categoryId,
  );

  if (!category) {
    throw new AppError("NOT_FOUND", "category not found", 404);
  }

  if (category.isDefault) {
    throw new AppError(
      "FORBIDDEN",
      "Default categories can not be modified",
      403,
    );
  }

  return category;
}