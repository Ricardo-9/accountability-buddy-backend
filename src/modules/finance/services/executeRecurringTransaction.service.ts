import { prisma } from "../../../lib/prisma.js"
import { adjustBalanceWithTx } from "../helpers/adjustBalanceWithTx.helper.js"
import { calculateNextOccurrence } from "../helpers/calculateNextOccurrence.helper.js"

export async function executeRecurringTransactionService(transactionId: string) {
    const now = new Date()

    return await prisma.$transaction(async (tx) => {
        const transaction = await tx.recurringTransaction.findUnique({
            where: { id: transactionId, deletedAt: null }
        })

        if (!transaction) return

        let nextDate = transaction.nextOccurrence

        while (nextDate <= now) {
            const balance = await tx.financeAccount.findUnique({
                where: { userId: transaction.userId },
                select: { balance: true }
            })

            const balanceBefore = Number(balance?.balance ?? 0)

            await adjustBalanceWithTx({
                tx,
                userId: transaction.userId,
                amount: Number(transaction.amount),
                type: transaction.type === "INCOME" ? "INCREMENT" : "DECREMENT",
                reason: transaction.type
            })

            const balanceAfter = transaction.type === "INCOME" ? balanceBefore + Number(transaction.amount) : balanceBefore - Number(transaction.amount)

            await tx.recurringTransactionExecution.create({
                data: {
                    transactionId,
                    amount: transaction.amount,
                    executedAt: nextDate,
                    balanceBefore,
                    balanceAfter
                }
            })

            nextDate = calculateNextOccurrence({ ...transaction, nextOccurrence: nextDate })

        }
        await tx.recurringTransaction.update({
            where: { id: transaction.id },
            data: {
                lastExecutedAt: now,
                nextOccurrence: nextDate
            }
        })
    })
}