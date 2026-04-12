import { prisma } from "../../../lib/prisma.js"
import { adjustBalanceWithTx } from "../helpers/adjustBalanceWithTx.helper.js"
import { calculateNextOccurrence } from "../helpers/calculateNextOccurrence.helper.js"
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js"
import { financeAccountRepository } from "../repositories/financeAccount.repository.js"
import { Prisma } from "@prisma/client"

export async function executeRecurringTransactionService(transactionId: string) {
    const now = new Date()

    return await prisma.$transaction(async (tx) => {
        const transaction = await recurringTransactionRepository.findById(tx, transactionId)

        if (!transaction) return

        let nextDate = transaction.nextOccurrence

        while (nextDate <= now) {
            const balance = await financeAccountRepository.getAccountBalance(tx, transaction.userId)

            const balanceBefore = balance?.balance ?? new Prisma.Decimal(0)

            await adjustBalanceWithTx({
                tx,
                userId: transaction.userId,
                amount: Number(transaction.amount),
                type: transaction.type === "INCOME" ? "INCREMENT" : "DECREMENT",
                reason: transaction.type
            })

            const balanceAfter = transaction.type === "INCOME" ? 
                balanceBefore.plus(transaction.amount) : 
                balanceBefore.minus(transaction.amount)

            await recurringTransactionRepository.createTransactionExecution(tx, {
                transactionId,
                amount: transaction.amount,
                executedAt: nextDate,
                balanceBefore,
                balanceAfter
            })

            nextDate = calculateNextOccurrence({ ...transaction, nextOccurrence: nextDate })

        }
        await recurringTransactionRepository.updateNextOccurrence(tx, transaction.id, {
            lastExecutedAt: now,
            nextOccurrence: nextDate
        })
    })
}