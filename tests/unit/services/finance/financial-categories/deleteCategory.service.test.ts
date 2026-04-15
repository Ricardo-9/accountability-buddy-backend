import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteCategoryService } from "../../../../../src/modules/finance/financial-categories/services/deleteCategory.service";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";
import { fetchCategory } from "../../../../../src/modules/finance/financial-categories/helpers/fetchCategory.helper";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock(
  "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

vi.mock(
  "../../../../../src/modules/finance/financial-categories/helpers/fetchCategory.helper",
);

describe("delete categories service test", () => {
  beforeEach(() => vi.clearAllMocks());
  
  (it("should delete the category", async () => {
    vi.mocked(fetchCategory).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date("2026-04-15T16:17:57.589Z"),
    });
    vi.mocked(financialCategoriesRepository.delete).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      deletedAt: new Date("2026-04-15T16:17:57.589Z"),
    });

    const result = await deleteCategoryService("userId", "categoryId");

    expect(result).toEqual({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      deletedAt: new Date("2026-04-15T16:17:57.589Z"),
    });
  }),
    it("should throw NOT_FOUND when category does not exist", async () => {
      const notFoundError = new AppError(
        "NOT_FOUND",
        "category not found",
        404,
      );
      vi.mocked(fetchCategory).mockRejectedValue(notFoundError);

      await expect(
        deleteCategoryService("userId", "categoryId"),
      ).rejects.toThrow("category not found");
    }),
    it("should throw FORBIDDEN when category is default", async () => {
      const isDefaultdError = new AppError(
        "FORBIDDEN",
        "Default categories can not be modified",
        403,
      );
      vi.mocked(fetchCategory).mockRejectedValue(isDefaultdError);

      await expect(
        deleteCategoryService("userId", "categoryId"),
      ).rejects.toThrow("Default categories can not be modified");
    }));
});
