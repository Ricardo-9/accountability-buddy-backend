import { prisma } from "../../../lib/prisma.js";

export const financialCategoriesRepository = {
  async findOneById(userId: string, categoryId: string) {
    return prisma.financialCategory.findFirst({
      where: {
        id: categoryId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
      },
    });
  },

  async findManyById(userId: string) {
    return prisma.financialCategory.findMany({
      where: { userId, deletedAt: null },
      select: {
        id: true,
        isDefault: true,
        name: true,
      },
    });
  },

  async findByNameExcludingId(
    userId: string,
    name: string,
    categoryId: string,
  ) {
    return prisma.financialCategory.findFirst({
      where: {
        userId,
        name,
        deletedAt: null,
        NOT: { id: categoryId },
      },
      select: { id: true },
    });
  },

  async create(userId: string, name: string) {
    return prisma.financialCategory.create({
      data: {
        userId,
        name,
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
      },
    });
  },

  async update(userId: string, categoryId: string, name: string) {
    return prisma.financialCategory.update({
      where: {
        id: categoryId,
        userId,
      },
      data: {
        name,
      },
      select: {
        id: true,
        isDefault: true,
        name: true,
      },
    });
  },

  async delete(userId: string, categoryId: string) {
    return prisma.financialCategory.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });
  },
};
