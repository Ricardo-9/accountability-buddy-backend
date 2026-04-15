import { describe, expect, it, vi, beforeEach } from "vitest";
import {createCategoryService} from "../../../../../src/modules/finance/financial-categories/services/createCategory.service"
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";
import { AppError } from "../../../../../src/core/errors/AppError";

const mockCategory = {
  id: "categoryId",
  name: "MOCKCATEGORY",
  isDefault: false,
  updatedAt: new Date(),
};

vi.mock(
  "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

describe("create category service test", () => {
  beforeEach(() => vi.clearAllMocks());

  (it("should create the category with normalized name and return it", async () => {
    vi.mocked(financialCategoriesRepository.create).mockResolvedValue(
      mockCategory
    );

    const result = await createCategoryService("userId", "mockcategory");

    expect(result).toEqual(mockCategory);
  }),
    it("should throw DUPLICATE_REGISTER when the name is already registered", async () => {
      const duplicateRegisterError = new AppError(
       "DUPLICATE_REGISTER",
          "The user already registered this category",
          409,
      );
      vi.mocked(financialCategoriesRepository.create).mockRejectedValue(
        duplicateRegisterError,
      );

      await expect(
        createCategoryService("userId", "mockcategory"),
      ).rejects.toThrow("The user already registered this category");
    }));
});
