import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { Prisma } from "@prisma/client";

export async function adjustBalanceService(
    userId: string,
    amount: number,
    type: "INCREMENT" | "DECREMENT",
    reason: "INCOME" | "EXPENSE"
) {
    const decimalAmount = new Prisma.Decimal(amount)

    return await prisma.$transaction(async (tx) => {
        const account = await tx.financeAccount.findUnique({
            where: { userId }
        })

        if (!account) throw new AppError("NOT_FOUND", "Finance account not found", 404)

        if (type === "DECREMENT" && account.balance.lt(amount))
            throw new AppError("INSUFFICIENT_FUNDS", "Insufficient balance")

        const updated = await tx.financeAccount.update({
            where: { userId },
            data: {
                balance: {
                    [type === "INCREMENT" ? "increment" : "decrement"]: amount
                }
            },
            select: {
                id: true,
                userId: true,
                balance: true,
                updatedAt: true
            }
        })

        const change = type === "INCREMENT" ? decimalAmount : decimalAmount.negated()

        await tx.financeBalanceHistory.create({
            data: {
                userId,
                balance: updated.balance,
                change,
                type: reason
            }
        })

        return updated
    })
}