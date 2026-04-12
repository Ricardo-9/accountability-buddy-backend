import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client/extension";

export const recurringTransactionRepository = {
    async findById (tx: Prisma.TransactionClient, id: string) {
        return await tx.recurringTransaction.findUnique({
            where: { id, deletedAt: null }
        })
    },

    async findPendingTransactions (prisma: PrismaClient) {
        const now = new Date()
        return await prisma.recurringTransaction.findMany({
            where: {
                nextOccurrence: { lte: now },
                deletedAt: null
            },
            select: { id: true }
        })
    },

    async createTransactionExecution (
        tx: Prisma.TransactionClient, 
        data: {
            transactionId: string,
            amount: Prisma.Decimal,
            executedAt: Date,
            balanceBefore: Prisma.Decimal,
            balanceAfter: Prisma.Decimal
        }
    ) {
        return await tx.recurringTransactionExecution.create({ data })
    },

    async updateNextOccurrence (
        tx: Prisma.TransactionClient,
        id: string,
        data: {
            lastExecutedAt: Date,
            nextOccurrence: Date
        }
    ) {
        return await tx.recurringTransaction.update({
            where: { id },
            data
        })
    }
}