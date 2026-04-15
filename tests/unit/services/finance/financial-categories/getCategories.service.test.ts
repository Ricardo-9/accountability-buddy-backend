import { describe, expect, it, vi, beforeEach } from "vitest";
import { getCategoriesService } from "../../../../../src/modules/finance/financial-categories/services/getCategories.service";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";

const mockCategory = {
  id: "categoryId",
  name: "MOCKCATEGORY",
  isDefault: false,
  updatedAt: new Date(),
};

vi.mock(
  "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository",
);

describe("get categories service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return categories for the user", async () => {
    vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
      mockCategory,
    ]);

    const result = await getCategoriesService("userId");

    expect(result).toEqual([mockCategory]);

    expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      10,
      undefined,
    );
  });

  it("should use the default limit of 10", async () => {
    vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
      mockCategory,
    ]);

    await getCategoriesService("userId");

    expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      10,
      undefined,
    );
  });

  it("should pass limit to repository", async () => {
    vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
      mockCategory,
    ]);

    await getCategoriesService("userId", 11);

    expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      11,
      undefined,
    );
  });

  it("should pass cursor to repository", async () => {
    vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
      mockCategory,
    ]);

    await getCategoriesService("userId", undefined, "cursor-123");

    expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      10,
      "cursor-123",
    );
  });

  it("should pass limit and cursor to repository", async () => {
    vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
      mockCategory,
    ]);

    await getCategoriesService("userId", 5, "cursor-123");

    expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      5,
      "cursor-123",
    );
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database failed");

    vi.mocked(financialCategoriesRepository.findManyById).mockRejectedValue(
      error,
    );

    await expect(getCategoriesService("user-123")).rejects.toThrow(
      "Database failed",
    );
  });
});
