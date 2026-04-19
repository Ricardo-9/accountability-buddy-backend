import { Prisma, PrismaClient } from "@prisma/client";
import { AppError } from "../../../../core/errors/AppError.js";

export async function ensureCategoryExists(
    tx: Prisma.TransactionClient | PrismaClient,
    userId: string,
    categoryId: string | null
) {
    if (!categoryId) return

    const category = await tx.financialCategory.findFirst({
        where: { id: categoryId, userId },
        select: { id: true }
    })

    if (!category) throw new AppError("NOT_FOUND", "Category not found", 404)
}