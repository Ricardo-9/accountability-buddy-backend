import { describe, expect, it, vi, beforeEach } from "vitest";
import { getOneCategoryService } from "../../../../../src/modules/finance/financial-categories/services/getOneCategory.service";
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

describe("get one category service test", () => {
  beforeEach(() => vi.clearAllMocks());

  (it("should return the category for the user", async () => {
    vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
      mockCategory,
    );

    const result = await getOneCategoryService("userId", "categoryId");

    expect(result).toEqual(mockCategory);
  }),
    it("should throw NOT_FOUND when the category does not exist", async () => {
      const notFoundError = new AppError(
        "NOT_FOUND",
        "category not found",
        404,
      );
      vi.mocked(financialCategoriesRepository.findOneById).mockRejectedValue(
        notFoundError,
      );

      await expect(
        getOneCategoryService("userId", "categoryId"),
      ).rejects.toThrow("category not found");
    }));
});
