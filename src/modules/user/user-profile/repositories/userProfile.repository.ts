import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin.js";
import { UpdateProfileBodyType } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId, deletedAt: null, status: "ACTIVE"},
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone:true,
        status: true
      }
    });
  },

  async update(userId: string, data: UpdateProfileBodyType) {
    return prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE"},
      data,
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone:true,
        status: true
      }
    });
  },

  async delete(userId: string) {
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "876000h"
    })

    if (banError) throw new AppError(
      "DELETE_ERROR",
      "Failed to deactivate account",
      502
    )

    return await prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE" },
      data: { deletedAt: new Date(), status: "DELETED" },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone:true,
        status: true
      }
    });
  },
};
