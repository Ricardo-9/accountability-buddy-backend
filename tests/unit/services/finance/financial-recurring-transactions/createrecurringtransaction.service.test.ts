import { describe, it, vi, expect, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { createRecurringTransactionService } from "../../../../../src/modules/finance/services/createrecurringtransaction.service"
import { RecurrenceUnit, TransactionType } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financialCategory: {
            findFirst: vi.fn()
        },
        recurringTransaction: {
            create: vi.fn()
        }
    }
}))

const firstOccurrence = new Date()

const mockTransaction = {
    type: TransactionType.INCOME,
    name: "Transaction name",
    amount: 1000,
    recurrenceValue: 15,
    recurrenceUnit: RecurrenceUnit.DAY,
    firstOccurrence,
    dayOfMonth: null,
    categoryId: null
}

describe("Create recurring transaction service test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should create a recurring transaction when categoryId is null", async () => {
        vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({ id: "transaction-id" } as any)

        const result = await createRecurringTransactionService("userId", mockTransaction)

        expect(prisma.financialCategory.findFirst).not.toHaveBeenCalled()
        expect(prisma.recurringTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    userId: "userId",
                    type: "INCOME",
                    name: "Transaction name",
                    amount: 1000,
                    recurrenceValue: 15,
                    recurrenceUnit: "DAY",
                    nextOccurrence: firstOccurrence
                }
            })
        )
        expect(prisma.recurringTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                select: {
                    id: true,
                    userId: true,
                    categoryId: true,
                    type: true,
                    name: true,
                    amount: true,
                    recurrenceValue: true,
                    recurrenceUnit: true,
                    dayOfMonth: true,
                    createdAt: true,
                    nextOccurrence: true
                }
            })
        )
        expect(result).toEqual({ id: "transaction-id" })
    })

    it("should create a recurring transaction when a valid categoryId is provided", async () => {
        vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({ id: "transaction-id" } as any)
        vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue({ id: "categoryId" } as any)

        await createRecurringTransactionService("userId", {...mockTransaction, categoryId: "categoryId"})

        expect(prisma.financialCategory.findFirst).toHaveBeenCalledWith({
            where: { id: "categoryId", userId: "userId" },
            select: { id: true }
        })
        expect(prisma.recurringTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ categoryId: "categoryId" })
            })
        )
    })

    it("should not create a transaction when an invalid categoryId is provided", async () => {
        vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null)

        await expect(createRecurringTransactionService("userId", {...mockTransaction, categoryId: "invalid"}))
            .rejects.toMatchObject({
                code: "NOT_FOUND",
                message: "Category not found",
                statusCode: 404
            })
        expect(prisma.recurringTransaction.create).not.toHaveBeenCalled()
    })

    it("should include dayOfMonth when provided", async () => {
        vi.mocked(prisma.recurringTransaction.create).mockResolvedValue({ id: "transaction-id" } as any)

        await createRecurringTransactionService("userId", {...mockTransaction, dayOfMonth: 8})

        expect(prisma.recurringTransaction.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ dayOfMonth: 8 })
            })
        )
    })
})