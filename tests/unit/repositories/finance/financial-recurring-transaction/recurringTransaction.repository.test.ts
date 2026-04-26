import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository"
vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financialGoal: {
            findMany: vi.fn()
        }
    }
}))

const mockTx = {
    recurringTransaction: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn()
    },
    recurringTransactionExecution: {
        create: vi.fn()
    }
} as unknown as Prisma.TransactionClient

describe("Recurring transaction repository test", () => {
    beforeEach(() => vi.clearAllMocks())

    describe("findById", () => {
        it("should call transaction with correct params", async () => {
            await recurringTransactionRepository.findById(mockTx, "id")

            expect(mockTx.recurringTransaction.findUnique).toHaveBeenCalledWith({
                where: { id: "id", deletedAt: null }
            })
        })
    })

    describe("findPendingTransactions", () => {
        it("should call transaction with correct params", async () => {
            await recurringTransactionRepository.findPendingTransactions(mockTx)

            expect(mockTx.recurringTransaction.findMany).toHaveBeenCalledWith({
                where: {
                    nextOccurrence: { lte: expect.any(Date) },
                    deletedAt: null
                },
                select: { id: true }
            })
        })
    })

    describe("createTransactionExecution", () => {
        it("should call transaction with correct params", async () => {
            const data = {
                transactionId: "transactionId",
                amount: new Prisma.Decimal(1000),
                executedAt: new Date(),
                balanceBefore: new Prisma.Decimal(1500),
                balanceAfter: new Prisma.Decimal(500)
            }

            await recurringTransactionRepository.createTransactionExecution(mockTx, data)

            expect(mockTx.recurringTransactionExecution.create).toHaveBeenCalledWith({ data })
        })
    })

    describe("updateNextOccurrence", () => {
        it("should call transaction with correct params", async () => {
            const data = {
                lastExecutedAt: new Date(),
                nextOccurrence: new Date()
            }

            await recurringTransactionRepository.updateNextOccurrence(mockTx, "id", data)

            expect(mockTx.recurringTransaction.update).toHaveBeenCalledWith({
                where: { id: "id" },
                data
            })
        })
    })
})