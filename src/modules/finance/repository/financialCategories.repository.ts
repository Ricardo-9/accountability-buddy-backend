import { prisma } from "../../../../src/lib/prisma.js";

export const financialCategoriesRepository = {

  async findOneById(userId:string,categoryId: string) {
    return prisma.financialCategory.findUnique({
      where: { id: categoryId,userId,deletedAt:null},
    });
  },
  async findManyById(userId: string) {
    return prisma.financialCategory.findMany({
      where: { userId ,deletedAt:null},
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

  async update(userId:string, categoryId: string, name: string) {
    return prisma.financialCategory.update({
      where: { id: categoryId ,userId,deletedAt:null},
      data: { name },
    });
  },

  async delete(userId:string, categoryId: string) {
    return prisma.financialCategory.update({
      where: { id: categoryId,userId,deletedAt:null },
      data: {deletedAt: new Date()}
    });
  },
};
