import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma"
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper"
import { goalDepositService } from "../../../../../src/modules/finance/services/goaldeposit.service"
import { Prisma } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn()
    }
}))

const mockTx = {
    financialGoal: {
        findUnique: vi.fn()
    },
    goalDeposit: {
        create: vi.fn()
    },
    goalProgressSnapshot: {
        findFirst: vi.fn(),
        create: vi.fn()
    }
}

vi.mock("../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper")

const goalId = "goalId"
const userId = "userId"

const mockDeposit = {
    id: "deposit-id",
    goalId,
    userId,
    amount: new Prisma.Decimal(1000),
    createdAt: new Date()
}


describe("Goal deposit service test", () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))
    })

    it("should create deposit, update balance and snapshot", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId })
        mockTx.goalDeposit.create.mockResolvedValue(mockDeposit)
        mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({ totalDeposited: new Prisma.Decimal(100) })
        vi.mocked(adjustBalanceWithTx).mockResolvedValue({ balance: 2000 } as any)

        const result = await goalDepositService(goalId, userId, 1000)

        expect(result).toEqual({
            deposit: mockDeposit,
            newBalance: 2000
        })
        expect(mockTx.goalDeposit.create).toHaveBeenCalledWith({
            data: {
                goalId,
                amount: new Prisma.Decimal(1000)
            }
        })
        expect(adjustBalanceWithTx).toHaveBeenCalledWith(
            expect.objectContaining({
                userId,
                amount: 1000,
                type: "DECREMENT",
                reason: "GOAL_DEPOSIT"
            })
        )
        expect(mockTx.goalProgressSnapshot.create).toHaveBeenCalledWith({
            data: {
                goalId,
                totalDeposited: new Prisma.Decimal(1100)
            }
        })
    })

    it("should throw if goal does not exist", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue(null)

        await (expect(goalDepositService(goalId, userId, 1000))).rejects.toThrow("Financial goal not found")
    })

    it("should create first snapshot when none exists", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId })
        mockTx.goalDeposit.create.mockResolvedValue(mockDeposit)
        mockTx.goalProgressSnapshot.findFirst.mockResolvedValue(null)

        await goalDepositService(goalId, userId, 1000)

        expect(mockTx.goalProgressSnapshot.create).toHaveBeenCalledWith({
            data: {
                goalId,
                totalDeposited: new Prisma.Decimal(1000)
            }
        })
    })

    it("should accumulate total deposited from last snapshot", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId })
        mockTx.goalDeposit.create.mockResolvedValue(mockDeposit)
        mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({ totalDeposited: new Prisma.Decimal(100) })

        await goalDepositService(goalId, userId, 1000)

        expect(mockTx.goalProgressSnapshot.create).toHaveBeenCalledWith({
            data: {
                goalId,
                totalDeposited: new Prisma.Decimal(1100)
            }
        })
    })

    it("should call adjustBalanceWithTx with type = 'DECREMENT'", async () => {
        mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId })
        mockTx.goalDeposit.create.mockResolvedValue(mockDeposit)
        mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({ totalDeposited: new Prisma.Decimal(100) })

        await goalDepositService(goalId, userId, 1000)

        expect(adjustBalanceWithTx).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "DECREMENT",
                reason: "GOAL_DEPOSIT"
            })
        )
    })
})