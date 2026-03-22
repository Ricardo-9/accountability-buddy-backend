import { FinancialCategory } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";
import { financialCategoriesRepository } from "../repository/financialCategories.repository.js";
import { Prisma } from "@prisma/client";
async function fetchCategory(
  userId: string,
  categoryId: string,
): Promise<FinancialCategory> {
  const category = await financialCategoriesRepository.findOneById(categoryId);

  if (!category || category.userId !== userId) {
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
  async getCategories(userId: string): Promise<FinancialCategory[]> {
      return financialCategoriesRepository.findManyById(userId);
    
  },

  async createCategory(
    userId: string,
    name: string,
  ): Promise<FinancialCategory> {
    try {
      return await financialCategoriesRepository.create(userId, name);
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

  async updateCategory(
    userId: string,
    categoryId: string,
    name: string,
  ): Promise<FinancialCategory> {
      await fetchCategory(userId, categoryId);
      return await financialCategoriesRepository.update(categoryId, name);
    
  },

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
      await fetchCategory(userId, categoryId);
      await financialCategoriesRepository.delete(categoryId);
    
  },
};
