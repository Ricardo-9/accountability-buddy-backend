import { prisma } from "../../../../lib/prisma.js";
import { UpdateProfile } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId, deletedAt: null },
    });
  },

  async update(userId: string, data: UpdateProfile) {
    return prisma.userProfile.update({
      where: { id: userId, deletedAt: null },
      data: data,
    });
  },

  async delete(userId: string) {
    return prisma.userProfile.update({
      where: { id: userId , deletedAt: null},
      data: { deletedAt: new Date(), status: "deleted" },
    });
  },
};
