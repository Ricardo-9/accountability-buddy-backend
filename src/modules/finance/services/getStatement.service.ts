import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";

export async function getStatementService(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit = 20,
    cursor?: string
) {
    if (startDate && endDate && startDate > endDate)
        throw new AppError(
            "INVALID_DATE_RANGE",
            "Start date must be before end date"
        )

    return await prisma.financeBalanceHistory.findMany({
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
}