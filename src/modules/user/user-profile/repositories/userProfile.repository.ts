import { prisma } from "../../../../lib/prisma.js";
import { UpdateProfile } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId},
    });
  },

  async update(userId: string, data: UpdateProfile) {
    return prisma.userProfile.update({
      where: { id: userId},
      data
    });
  },

  async delete(userId: string) {
    await prisma.userProfile.update({
      where: { id: userId},
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },
};