import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";

export async function getGoalsService(
    userId: string,
    categoryId: string | null,
    limit = 10,
    cursor?: string
) {
    return await prisma.$transaction(async (tx) => {
        if (categoryId) {
            const category = await tx.financialCategory.findFirst({
                where: { id: categoryId, userId },
                select: { id: true }
            })

            if (!category) throw new AppError("NOT_FOUND", "Category not found", 404)
        }

        const goals = await tx.financialGoal.findMany({
            where: {
                userId,
                ...(categoryId && { categoryId })
            },
            select: {
                id: true,
                userId: true,
                categoryId: true,
                name: true,
                target: true,
                initialAmount: true,
                durationValue: true,
                durationUnit: true,
                style: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ],
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            })
        })

        return goals
    })
}