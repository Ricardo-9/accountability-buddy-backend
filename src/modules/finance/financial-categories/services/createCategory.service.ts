import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { Prisma } from "@prisma/client";
import { normalizeCategoryName } from "../../shared/helpers/normalizeCategoryName.js";

export async function createCategoryService(userId: string, name: string) {
  const normalizedName = normalizeCategoryName(name);

  if (!normalizedName) {
    throw new AppError("INVALID_DATA", "Category name cannot be empty", 400);
  }

  try {
    return await financialCategoriesRepository.create(userId, normalizedName);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        throw new AppError(
          "DUPLICATE_REGISTER",
          "The user already registered this category",
          409,
        );
      }
    }
    throw err;
  }
}
