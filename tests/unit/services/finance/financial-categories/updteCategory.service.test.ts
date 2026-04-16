import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateCategoryService } from "../../../../../src/modules/finance/financial-categories/services/updateCategory.service";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";
import { fetchCategory } from "../../../../../src/modules/finance/financial-categories/helpers/fetchCategory.helper";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock(
  "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

vi.mock(
  "../../../../../src/modules/finance/financial-categories/helpers/fetchCategory.helper",
);

describe("update category service test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should update the category", async () => {
    vi.mocked(fetchCategory).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date(),
    });

    vi.mocked(financialCategoriesRepository.update).mockResolvedValue({
      id: "categoryId",
      name: "UPDATEDMOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date(),
    });

    const result = await updateCategoryService(
      "userId",
      "categoryId",
      "UPDATEDMOCKCATEGORY",
    );

    expect(fetchCategory).toHaveBeenCalledWith("userId", "categoryId");

    expect(result.name).toBe("UPDATEDMOCKCATEGORY");
  });

  it("should normalize the category name", async () => {
    vi.mocked(fetchCategory).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date(),
    });

    vi.mocked(financialCategoriesRepository.update).mockResolvedValue({
      id: "categoryId",
      name: "UPDATEMOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date(),
    });

    await updateCategoryService(
      "userId",
      "categoryId",
      "  updateMockCategory  ",
    );

    expect(financialCategoriesRepository.update).toHaveBeenCalledWith(
      "userId",
      "categoryId",
      "UPDATEMOCKCATEGORY",
    );
  });

  it("should throw DUPLICATE_REGISTER when name already exists", async () => {
    vi.mocked(fetchCategory).mockResolvedValue({
      id: "categoryId",
      name: "MOCKCATEGORY",
      isDefault: false,
      updatedAt: new Date(),
    });

    const duplicateError = new AppError(
      "DUPLICATE_REGISTER",
      "The user already registered this category",
      409,
    );

    vi.mocked(financialCategoriesRepository.update).mockRejectedValue(
      duplicateError,
    );

    await expect(
      updateCategoryService("userId", "categoryId", "FOOD"),
    ).rejects.toMatchObject({
      code: "DUPLICATE_REGISTER",
      statusCode: 409,
    });
  });

  it("should throw NOT_FOUND when category does not exist", async () => {
    vi.mocked(fetchCategory).mockRejectedValue(
      new AppError("NOT_FOUND", "category not found", 404),
    );

    await expect(
      updateCategoryService("userId", "categoryId", "FOOD"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
    });
  });

  it("should throw FORBIDDEN when category is default", async () => {
    vi.mocked(fetchCategory).mockRejectedValue(
      new AppError(
        "FORBIDDEN",
        "Default categories can not be modified",
        403,
      ),
    );

    await expect(
      updateCategoryService("userId", "categoryId", "FOOD"),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
      statusCode: 403,
      message:"Default categories can not be modified"
    });
  });
});