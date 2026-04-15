import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";

import { financialCategoriesRepository } from "../../../../../src/modules/finance/financial-categories/repositories/financialCategories.repository";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    financialCategory: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("financialCategoriesRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should find one category", async () => {
    vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue({} as any);

    await financialCategoriesRepository.findOneById("user", "cat");

    expect(prisma.financialCategory.findFirst).toHaveBeenCalledWith({
      where: {
        id: "cat",
        userId: "user",
        deletedAt: null,
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
        updatedAt: true,
      },
    });
  });

  it("should find many categories", async () => {
    vi.mocked(prisma.financialCategory.findMany).mockResolvedValue([]);

    await financialCategoriesRepository.findManyById("user", 10);

    expect(prisma.financialCategory.findMany).toHaveBeenCalled();
  });

  it("should create category", async () => {
    vi.mocked(prisma.financialCategory.create).mockResolvedValue({} as any);

    await financialCategoriesRepository.create("user", "FOOD");

    expect(prisma.financialCategory.create).toHaveBeenCalledWith({
      data: {
        userId: "user",
        name: "FOOD",
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
        updatedAt: true,
      },
    });
  });

  it("should update category", async () => {
    vi.mocked(prisma.financialCategory.update).mockResolvedValue({} as any);

    await financialCategoriesRepository.update("user", "id", "FOOD");

    expect(prisma.financialCategory.update).toHaveBeenCalledWith({
      where: {
        id: "id",
        userId: "user",
      },
      data: {
        name: "FOOD",
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
        updatedAt: true,
      },
    });
  });

  it("should soft delete category", async () => {
    vi.mocked(prisma.financialCategory.update).mockResolvedValue({} as any);

    await financialCategoriesRepository.delete("user", "id");

    expect(prisma.financialCategory.update).toHaveBeenCalledWith({
      where: {
        id: "id",
        userId: "user",
      },
      data: {
        deletedAt: expect.any(Date),
      },
    });
  });
});