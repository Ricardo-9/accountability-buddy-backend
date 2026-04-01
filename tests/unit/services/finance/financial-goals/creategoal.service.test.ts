import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper"
import { createGoalService } from "../../../../../src/modules/finance/services/creategoal.service"
import { DurationUnit, FinanceAccount, InvestorStyle, Prisma } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn()
    }
}))
vi.mock("../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper")

const txMock = {
    financeAccount: {
        findUnique: vi.fn()
    },
    financialCategory: {
        findFirst: vi.fn()
    },
    financialGoal: {
        create: vi.fn()
    }
}

const adjustBalanceWithTxMock = vi.mocked(adjustBalanceWithTx)

const mockGoal = {
    id: "goalId",
    userId: "userId",
    name: "goalName",
    target: new Prisma.Decimal(1000),
    initialAmount: new Prisma.Decimal(100),
    durationValue: 12,
    durationUnit: DurationUnit.MONTHS,
    style: InvestorStyle.LOW,
    categoryId: "categoryId",
    createdAt: new Date()
}

describe("Create financial goal service test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn(txMock as any))
    })

    it("should create goal with category and return goal data and new balance", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue({ id: "categoryId" })
        txMock.financialGoal.create.mockResolvedValue(mockGoal)
        adjustBalanceWithTxMock.mockResolvedValue({ balance: new Prisma.Decimal(100) } as unknown as FinanceAccount)

        const result = await createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "categoryId")

        expect(result).toEqual({
            goal: mockGoal,
            newBalance: new Prisma.Decimal(100)
        })
    })

    it("should create goal without category and return goal data and new balance", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialGoal.create.mockResolvedValue({ ...mockGoal, categoryId: null })
        adjustBalanceWithTxMock.mockResolvedValue({ balance: new Prisma.Decimal(100) } as unknown as FinanceAccount)

        const result = await createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", null)

        expect(txMock.financialCategory.findFirst).not.toHaveBeenCalled()
        expect(result).toEqual({
            goal: { ...mockGoal, categoryId: null },
            newBalance: new Prisma.Decimal(100)
        })
    })

    it("should throw an AppError when the provided category is not valid", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue(null)

        await expect(
            createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "invalidCategoryId")
        ).rejects.toMatchObject({
            code: "NOT_FOUND",
            statusCode: 404,
            message: "Category not found"
        })
    })

    it("should pass Decimal values to financialGoal.create", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue({ id: "categoryId" })
        txMock.financialGoal.create.mockResolvedValue(mockGoal)
        adjustBalanceWithTxMock.mockResolvedValue({ balance: new Prisma.Decimal(100) } as unknown as FinanceAccount)

        await createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "categoryId")

        expect(txMock.financialGoal.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    target: new Prisma.Decimal(1000),
                    initialAmount: new Prisma.Decimal(100)
                })
            })
        )
    })

    it("should call adjustBalanceWithTx with correct params", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue({ id: "categoryId" })
        txMock.financialGoal.create.mockResolvedValue(mockGoal)
        adjustBalanceWithTxMock.mockResolvedValue({ balance: new Prisma.Decimal(100) } as unknown as FinanceAccount)

        await createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "categoryId")

        expect(adjustBalanceWithTx).toHaveBeenCalledWith({
            tx: txMock,
            userId: "userId",
            amount: 100,
            type: "DECREMENT",
            reason: "GOAL_CREATE"
        })
    })

    it("should select the expected fields on goal creation", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue({ id: "categoryId" })
        txMock.financialGoal.create.mockResolvedValue(mockGoal)
        adjustBalanceWithTxMock.mockResolvedValue({ balance: new Prisma.Decimal(100) } as unknown as FinanceAccount)

        await createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "categoryId")

        expect(txMock.financialGoal.create).toHaveBeenCalledWith(
            expect.objectContaining({
                select: {
                    id: true,
                    userId: true,
                    name: true,
                    target: true,
                    initialAmount: true,
                    durationValue: true,
                    durationUnit: true,
                    style: true,
                    categoryId: true,
                    createdAt: true
                }
            })
        )
    })

    it("should propagate error from adjustBalanceWithTx", async () => {
        txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" })
        txMock.financialCategory.findFirst.mockResolvedValue({ id: "categoryId" })
        txMock.financialGoal.create.mockResolvedValue(mockGoal)

        adjustBalanceWithTxMock.mockRejectedValue(new Error("Adjust Balance Error"))

        await expect(
            createGoalService("userId", "goalName", 1000, 100, 12, "MONTHS", "LOW", "categoryId")
        ).rejects.toThrow("Adjust Balance Error")
    })
})