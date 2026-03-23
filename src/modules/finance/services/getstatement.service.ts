import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";

export async function getStatementService(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 20,
    cursor?: string
) {
    const statement = await prisma.financeBalanceHistory.findMany({
        where: {
            userId,
            ...(startDate || endDate ? {
                createdAt: {
                    ...(startDate && { gte: startDate }),
                    ...(endDate && { lte: endDate })
                }
            } : {})
        },
        select: {
            id: true,
            balance: true,
            change: true,
            type: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        },
        take: limit,
        ...(cursor && {
            skip: 1,
            cursor: { id: cursor }
        })
    })

    if (statement.length === 0) throw new AppError("NONEXISTENT_ACCOUNT", "The user does not have an account")

    return statement
}