import { describe, expect, it, vi, beforeEach } from "vitest";
import { financialCategoriesRepository } from "../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";
import { fetchCategory } from "../../../src/modules/finance/financial-categories/helpers/fetchCategory.helper";
import { AppError } from "../../../src/core/errors/AppError";

vi.mock(
  "../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

describe("fetch category helper test", () => {
  beforeEach(() => vi.clearAllMocks());

  (it("should dreturn the category when it exist", async () => {
    vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date("2026-04-15T16:17:57.589Z"),
    });

    const result = await fetchCategory("userId", "categoryId");

    expect(financialCategoriesRepository.findOneById).toHaveBeenCalledWith(
      "userId",
      "categoryId",
    );

    expect(result).toEqual({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date("2026-04-15T16:17:57.589Z"),
    });
  }),
    it("should throw NOT_FOUND when category does not exist", async () => {
      const notFoundError = new AppError(
        "NOT_FOUND",
        "category not found",
        404,
      );
      vi.mocked(financialCategoriesRepository.findOneById).mockRejectedValue(
        notFoundError,
      );

      await expect(fetchCategory("userId", "categoryId")).rejects.toMatchObject(
        {
          code: "NOT_FOUND",
          statusCode: 404,
          message: "category not found",
        },
      );
    }),
    it("should throw FORBIDDEN when category is default", async () => {
      const isDefaultdError = new AppError(
        "FORBIDDEN",
        "Default categories can not be modified",
        403,
      );
      vi.mocked(financialCategoriesRepository.findOneById).mockRejectedValue(
        isDefaultdError,
      );

      await expect(fetchCategory("userId", "categoryId")).rejects.toMatchObject(
        {
          code: "FORBIDDEN",
          statusCode: 403,
          message: "Default categories can not be modified",
        },
      );
    }));
});
