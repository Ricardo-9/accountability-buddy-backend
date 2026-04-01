import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma"
import { Prisma } from "@prisma/client";
import { updateGoalService } from "../../../../../src/modules/finance/services/updategoal.service"
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn()
    }
}))

const mockTx = {
    financialGoal: {
        findUnique: vi.fn(),
        update: vi.fn()
    },
    financialCategory: {
        findUnique: vi.fn()
    }
}

vi.mock("../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper")

const userId = "userId"
const goalId = "goalId"

describe("Update financial goals service test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))
    })

    it("should update goal without change balance when initial amount is not provided", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({ id: goalId })

        const result = await updateGoalService(goalId, userId, undefined, "New name")

        expect(result.updatedGoal).toBeDefined()
        expect(adjustBalanceWithTx).not.toHaveBeenCalled()
    })

    it("should decrement balance when initial amount increases", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({})

        await updateGoalService(goalId, userId, undefined, undefined, undefined, 30)

        expect(adjustBalanceWithTx).toHaveBeenCalledWith(
            expect.objectContaining({
                userId,
                amount: 10,
                type: "DECREMENT",
                reason: "GOAL_UPDATE"
            })
        )
    })

    it("should increment balance when initial amount decreases", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({})

        await updateGoalService(goalId, userId, undefined, undefined, undefined, 10)

        expect(adjustBalanceWithTx).toHaveBeenCalledWith(
            expect.objectContaining({
                userId,
                amount: 10,
                type: "INCREMENT",
                reason: "GOAL_UPDATE"
            })
        )
    })

    it("should not adjust balance when initial amount is unchanged", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({})

        await updateGoalService(goalId, userId, undefined, undefined, undefined, 20)

        expect(adjustBalanceWithTx).not.toHaveBeenCalled()
    })

    it("should throw if goal does not exist", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue(null)

        await expect(updateGoalService(goalId, userId)).rejects.toThrow("Financial goal not found")
    })

    it("should throw if category is invalid", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialCategory.findUnique(null)

        await expect(updateGoalService(goalId, userId, "invalid-category")).rejects.toThrow("Category not found")
    })

    it("should throw when initial amount is greater than target", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        await expect(updateGoalService(goalId, userId, undefined, undefined, undefined, 200)).rejects.toThrow("Initial amount cannot be greater than target")
    })

    it("should throw when updating target below initial amount", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        await expect(updateGoalService(goalId, userId, undefined, undefined, 19)).rejects.toThrow("Initial amount cannot be greater than target")
    })

    it("should handle initial amount = 0", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({})

        await updateGoalService(goalId, userId, undefined, undefined, undefined, 0)

        expect(adjustBalanceWithTx).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 20,
                type: "INCREMENT"
            })
        )
    })

    it("should allow removing category (category = null)", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({
            target: new Prisma.Decimal(100),
            initialAmount: new Prisma.Decimal(20)
        })

        mockTx.financialGoal.update.mockResolvedValue({})

        await updateGoalService(goalId, userId, null)

        expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    categoryId: null
                }
            })
        )
    })
})