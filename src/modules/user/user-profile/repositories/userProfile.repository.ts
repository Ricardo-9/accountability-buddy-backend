import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin.js";
import { UpdateProfileBodyType } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId, deletedAt: null, status: "ACTIVE"},
    });
  },

  async update(userId: string, data: UpdateProfileBodyType) {
    return prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE"},
      data,
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

    await prisma.userProfile.update({
      where: { id: userId, deletedAt: null, status: "ACTIVE" },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },
};
