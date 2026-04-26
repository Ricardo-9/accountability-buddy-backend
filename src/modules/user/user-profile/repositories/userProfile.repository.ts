// src/modules/user/user-profile/repositories/userProfile.repository.ts

import { prisma } from "../../../../lib/prisma.js";
import { UpdateProfileBodyType } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId, deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone: true,
        status: true,
      },
    });
  },

  async update(userId: string, data: UpdateProfileBodyType) {
    return prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE" },
      data,
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone: true,
        status: true,
      },
    });
  },

  async softDelete(userId: string) {
    return prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE" },
      data: { deletedAt: new Date(), status: "DELETED" },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone: true,
        status: true,
      },
    });
  },

  async reactivate(userId: string) {
    return prisma.userProfile.update({
      where: { id: userId },
      data: { deletedAt: null, status: "ACTIVE" },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone: true,
        status: true,
      },
    });
  },
};