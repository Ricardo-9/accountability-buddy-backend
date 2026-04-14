import { FinancialCategory } from "@prisma/client";
import { AppError } from "../../../../core/errors/AppError.js";
import { financialCategoriesRepository } from "../repositories/financialCategories.repository.js";
import { Prisma } from "@prisma/client";
import { normalizeCategoryName } from "../../shared/helpers/normalizeCategoryName.js";

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

export const financialCategoriesServices = {
  async getCategories(userId: string) {
    return financialCategoriesRepository.findManyById(userId);
  },

  async createCategory(userId: string, name: string) {
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
  },

  async updateCategory(userId: string, categoryId: string, name: string) {
    await fetchCategory(userId, categoryId);

    const normalizedName = normalizeCategoryName(name);

    if (!normalizedName) {
      throw new AppError("INVALID_DATA", "Category name cannot be empty", 400);
    }

    try {
      return await financialCategoriesRepository.update(
        userId,
        categoryId,
        normalizedName,
      );
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
  },

  async deleteCategory(userId: string, categoryId: string) {
    await fetchCategory(userId, categoryId);
    await financialCategoriesRepository.delete(userId, categoryId);
  },
};
