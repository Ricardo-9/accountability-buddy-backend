import { Prisma } from "@prisma/client"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { prisma } from "../../../../src/lib/prisma"
import { adjustBalanceWithTx } from "../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper"
import { AppError } from "../../../../src/core/errors/AppError"

vi.mock("../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn()
    }
}))

function mockTx(overrides: {
    account?: object | null,
    updatedAccount?: object,
    createShouldFail?: boolean
}) {
    const account = overrides.account !== undefined ? overrides.account : {
        id: "accId",
        userId: "userId",
        balance: new Prisma.Decimal(100)
    }

    const updatedAccount = overrides.updatedAccount !== undefined ? overrides.updatedAccount : {
        id: "accId",
        userId: "userId",
        balance: new Prisma.Decimal(150),
        updatedAt: new Date()
    }

    return {
        financeAccount: {
            findUnique: vi.fn().mockResolvedValue(account),
            update: vi.fn().mockResolvedValue(updatedAccount)
        },
        financeBalanceHistory: {
            create: overrides.createShouldFail ?
                vi.fn().mockRejectedValue(new Error("Db error")) :
                vi.fn().mockResolvedValue({})
        }
    }
}

describe("AdjustBalanceWithTx helper test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should call update with increment and create history with positive balance change", async () => {
        const tx = mockTx({})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        const result = await adjustBalanceWithTx({
            tx: tx as unknown as Prisma.TransactionClient,
            userId: "userId",
            amount: 50,
            type: "INCREMENT",
            reason: "INCOME"
        })

        expect(tx.financeAccount.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    balance: {
                        increment: 50
                    }
                }
            })
        )
        expect(tx.financeBalanceHistory.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    change: new Prisma.Decimal(50),
                    type: "INCOME"
                })
            })
        )
        expect(result.balance.toString()).toBe("150")
    })

    it("should call update with decrement and create history with negative balance change", async () => {
        const tx = mockTx({
            updatedAccount: {
                id: "accId",
                userId: "userId",
                balance: new Prisma.Decimal(50),
                updatedAt: new Date()
            }
        })

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        const result = await adjustBalanceWithTx({
            tx: tx as unknown as Prisma.TransactionClient,
            userId: "userId",
            amount: 50,
            type: "DECREMENT",
            reason: "EXPENSE"
        })

        expect(tx.financeAccount.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: {
                    balance: {
                        decrement: 50
                    }
                }
            })
        )
        expect(tx.financeBalanceHistory.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    change: new Prisma.Decimal(-50),
                    type: "EXPENSE"
                })
            })
        )
        expect(result.balance.toString()).toBe("50")
    })

    it("should throw an AppError (404) if account does not exist", async () => {
        const tx = mockTx({ account: null })

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(
            adjustBalanceWithTx({
                tx: tx as unknown as Prisma.TransactionClient,
                userId: "userId",
                amount: 50,
                type: "DECREMENT",
                reason: "EXPENSE"
            })
        ).rejects.toMatchObject({
            code: "NOT_FOUND",
            statusCode: 404
        })
    })

    it("should throw an AppError (422) if balance < amount in 'DECREMENT'", async () => {
        const tx = mockTx({})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(
            adjustBalanceWithTx({
                tx: tx as unknown as Prisma.TransactionClient,
                userId: "userId",
                amount: 200,
                type: "DECREMENT",
                reason: "EXPENSE"
            })
        ).rejects.toMatchObject({
            code: "INSUFFICIENT_FUNDS",
            statusCode: 422
        })
    })

    it("should allow decrement when balance = amount", async () => {
        const tx = mockTx({})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(
            adjustBalanceWithTx({
                tx: tx as unknown as Prisma.TransactionClient,
                userId: "userId",
                amount: 100,
                type: "DECREMENT",
                reason: "EXPENSE"
            })
        ).resolves.not.toThrow(AppError)
    })

    it("should propagate error if financeBalanceHistory.create fails", async () => {
        const tx = mockTx({ createShouldFail: true })

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(
            adjustBalanceWithTx({
                tx: tx as unknown as Prisma.TransactionClient,
                userId: "userId",
                amount: 100,
                type: "DECREMENT",
                reason: "EXPENSE"
            })
        ).rejects.toThrow("Db error")
    })
})