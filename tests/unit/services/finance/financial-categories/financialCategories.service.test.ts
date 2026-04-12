import { describe, expect, it, vi, beforeEach } from "vitest";
import { financialCategoriesRepository } from "../../../../../src/modules/finance/repositories/financialCategories.repository";
import { financialCategoriesServices } from "../../../../../src/modules/finance/services/financialCategories.service";
import { Prisma } from "@prisma/client";

const mockCategory = {
  id: "category-123",
  userId: "user-123",
  name: "RANDOM_CATEGORY",
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

vi.mock(
  "../../../../../src/modules/finance/repositories/financialCategories.repository",
);

describe("financialCategoriesServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCategories", () => {
    it("should return categories for the user", async () => {
      vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue([
        mockCategory,
      ]);

      const result =
        await financialCategoriesServices.getCategories("user-123");

      expect(result).toEqual([mockCategory]);
      expect(financialCategoriesRepository.findManyById).toHaveBeenCalledWith(
        "user-123",
      );
    });

    it("should return empty array when user has no categories", async () => {
      vi.mocked(financialCategoriesRepository.findManyById).mockResolvedValue(
        [],
      );

      const result =
        await financialCategoriesServices.getCategories("user-123");

      expect(result).toEqual([]);
    });
  });

  describe("createCategory", () => {
    it("should create and return the new category", async () => {
      vi.mocked(financialCategoriesRepository.create).mockResolvedValue(
        mockCategory,
      );

      const result = await financialCategoriesServices.createCategory(
        "user-123",
        "RANDOM_CATEGORY",
      );

      expect(result).toEqual(mockCategory);
      expect(financialCategoriesRepository.create).toHaveBeenCalledWith(
        "user-123",
        "RANDOM_CATEGORY",
      );
    });

    it("should throw DUPLICATE_REGISTER when category name already exists", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );

      vi.mocked(financialCategoriesRepository.create).mockRejectedValue(
        prismaError,
      );

      await expect(
        financialCategoriesServices.createCategory(
          "user-123",
          "RANDOM_CATEGORY",
        ),
      ).rejects.toMatchObject({
        code: "DUPLICATE_REGISTER",
        message: "The user already registered this category",
        statusCode: 409,
      });
    });

    it("should rethrow unknown errors", async () => {
      const unknownError = new Error("Database connection lost");

      vi.mocked(financialCategoriesRepository.create).mockRejectedValue(
        unknownError,
      );

      await expect(
        financialCategoriesServices.createCategory(
          "user-123",
          "RANDOM_CATEGORY",
        ),
      ).rejects.toThrow("Database connection lost");
    });
  });

  describe("updateCategory", () => {
    it("should update and return category with normalized name", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        mockCategory,
      );

      vi.mocked(financialCategoriesRepository.update).mockResolvedValue({
        ...mockCategory,
        name: "NEWNAME",
      });

      const result = await financialCategoriesServices.updateCategory(
        "user-123",
        "category-123",
        "new name",
      );

      expect(result.name).toBe("NEWNAME");

      expect(financialCategoriesRepository.update).toHaveBeenCalledWith(
        "user-123",
        "category-123",
        "NEWNAME",
      );
    });

    it("should normalize name before updating", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        mockCategory,
      );

      vi.mocked(financialCategoriesRepository.update).mockResolvedValue({
        ...mockCategory,
        name: "FOOD",
      });

      await financialCategoriesServices.updateCategory(
        "user-123",
        "category-123",
        "   food   ",
      );

      expect(financialCategoriesRepository.update).toHaveBeenCalledWith(
        "user-123",
        "category-123",
        "FOOD",
      );
    });

    it("should throw DUPLICATE_REGISTER when category name already exists", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        mockCategory,
      );

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        { code: "P2002", clientVersion: "5.0.0" },
      );

      vi.mocked(financialCategoriesRepository.update).mockRejectedValue(
        prismaError,
      );

      await expect(
        financialCategoriesServices.updateCategory(
          "user-123",
          "category-123",
          "FOOD",
        ),
      ).rejects.toMatchObject({
        code: "DUPLICATE_REGISTER",
        message: "The user already registered this category",
        statusCode: 409,
      });
    });

    it("should throw NOT_FOUND when category does not exist", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        null,
      );

      await expect(
        financialCategoriesServices.updateCategory(
          "user-123",
          "category-123",
          "NEW_NAME",
        ),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "category not found",
        statusCode: 404,
      });
    });

    it("should throw FORBIDDEN when trying to update default category", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue({
        ...mockCategory,
        isDefault: true,
      });

      await expect(
        financialCategoriesServices.updateCategory(
          "user-123",
          "category-123",
          "NEW_NAME",
        ),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
    });
  });

  describe("deleteCategory", () => {
    it("should delete the category when it exists and belongs to user", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        mockCategory,
      );
      vi.mocked(financialCategoriesRepository.delete).mockResolvedValue(
        mockCategory,
      );

      await financialCategoriesServices.deleteCategory(
        "user-123",
        "category-123",
      );

      expect(financialCategoriesRepository.delete).toHaveBeenCalledWith(
        "user-123",
        "category-123",
      );
    });

    it("should throw NOT_FOUND when category does not exist", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue(
        null,
      );

      await expect(
        financialCategoriesServices.deleteCategory("user-123", "category-123"),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should throw FORBIDDEN when trying to delete a default category", async () => {
      vi.mocked(financialCategoriesRepository.findOneById).mockResolvedValue({
        ...mockCategory,
        isDefault: true,
      });

      await expect(
        financialCategoriesServices.deleteCategory("user-123", "category-123"),
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
    });
  });
});
