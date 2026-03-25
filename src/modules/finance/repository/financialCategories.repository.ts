import { prisma } from "../../../../src/lib/prisma.js";

export const financialCategoriesRepository = {

  async findOneById(categoryId: string) {
    return prisma.financialCategory.findUnique({
      where: { id: categoryId},
    });
  },
  async findManyById(userId: string) {
    return prisma.financialCategory.findMany({
      where: { userId },
    });
  },

  async create(userId: string, name: string) {
    return prisma.financialCategory.create({
      data: {
        userId,
        name,
      },
    });
  },

  async update( categoryId: string, name: string) {
    return prisma.financialCategory.update({
      where: { id: categoryId },
      data: { name },
    });
  },

  async delete( categoryId: string) {
    return prisma.financialCategory.delete({
      where: { id: categoryId },
    });
  },
};
