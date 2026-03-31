import { Prisma } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../helpers/adjustBalanceWithTx.helper.js";

export async function goalDepositService(
    id: string,
    userId: string,
    amount: number,
) {
    return await prisma.$transaction(async (tx) => {
        const decimalAmount = new Prisma.Decimal(amount)

        const goal = await tx.financialGoal.findUnique({
            where: { id, userId },
            select: { id: true }
        })

        if (!goal) throw new AppError("NOT_FOUND", "Financial goal not found", 404)

        const deposit = await tx.goalDeposit.create({
            data: {
                goalId: id,
                amount: decimalAmount
            }
        })

        const updatedBalance = await adjustBalanceWithTx({
            tx,
            userId,
            amount,
            type: "DECREMENT",
            reason: "GOAL_DEPOSIT"
        })

        const lastSnapshot = await tx.goalProgressSnapshot.findFirst({
            where: { goalId: id },
            orderBy: { createdAt: "desc" }
        })

        const newTotal = lastSnapshot ? lastSnapshot.totalDeposited.plus(decimalAmount) : decimalAmount

        await tx.goalProgressSnapshot.create({
            data: {
                goalId: id,
                totalDeposited: newTotal
            }
        })

        return {
            deposit,
            newBalance: updatedBalance.balance
        }
    })
}