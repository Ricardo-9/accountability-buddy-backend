import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { supabaseAdmin } from "../../../../lib/supabaseAdmin.js";
import { UpdateProfile } from "../schemas/updateProfile.schema.js";

export const userProfileRepository = {
  async findById(userId: string) {
    return prisma.userProfile.findUnique({
      where: { id: userId },
    });
  },

  async update(userId: string, data: UpdateProfile) {
    return prisma.userProfile.update({
      where: { id: userId },
      data: Object.assign(
        {},
        data.fullName !== undefined && { fullName: data.fullName },
        data.phone !== undefined && { phone: data.phone },
        data.birthDate !== undefined && { birthDate: data.birthDate },
      ),
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
      where: { id: userId },
      data: { deletedAt: new Date(), status: "DELETED" },
    });
  },
};
