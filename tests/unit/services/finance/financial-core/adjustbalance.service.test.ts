import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import { adjustBalanceService } from "../../../../../src/modules/finance/services/adjustbalance.service"
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("../../../../../src/lib/prisma", () => ({
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
        id: "account-id",
        userId: "random-id",
        balance: new Prisma.Decimal(100)
    }

    const updatedAccount = overrides.updatedAccount !== undefined ? overrides.updatedAccount : {
        id: "account-id",
        userId: "random-id",
        balance: new Prisma.Decimal(150),
        updatedAt: new Date()
    }

    return {
        financeAccount: {
            findUnique: vi.fn().mockResolvedValue(account),
            update: vi.fn().mockResolvedValue(updatedAccount)
        },
        financeBalanceHistory: {
            create: overrides.createShouldFail
                ? vi.fn().mockRejectedValue(new Error("DB Error"))
                : vi.fn().mockResolvedValue({})
        }
    }
}

describe("Adjust balance test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should call update with 'increment' and create history with positive balance change", async () => {
        const tx = mockTx({
            updatedAccount: {
                id: "account-id",
                userId: "random-id",
                balance: new Prisma.Decimal(150),
                updatedAt: new Date()
            }
        })

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        const result = await adjustBalanceService("random-id", 50, "INCREMENT", "INCOME")

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

    it("should call update with 'decrement' and create history with negative change", async () => {
        const tx = mockTx({
            updatedAccount: {
                id: "account-id",
                userId: "random-id",
                balance: new Prisma.Decimal(50),
                updatedAt: new Date()
            }
        })

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        const result = await adjustBalanceService("random-id", 50, "DECREMENT", "EXPENSE")

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

    it("should throw an AppError (404 - NOT_FOUND) if the account does not exist", async () => {
        const tx = mockTx({account: null})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(adjustBalanceService("random-id", 50, "DECREMENT", "EXPENSE")).rejects.toMatchObject({
            code: "NOT_FOUND",
            statusCode: 404
        })
    })

    it("should throw an AppError (400 - INSUFFICIENT_FUNDS) if balance < amount in 'DECREMENT'", async () => {
        const tx = mockTx({})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(adjustBalanceService("random-id", 200, "DECREMENT", "EXPENSE")).rejects.toMatchObject({
            code: "INSUFFICIENT_FUNDS",
            statusCode: 400
        })
    })

    it("should allow decrement when balance equals to amount exactly", async () => {
        const tx = mockTx({})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(adjustBalanceService("random-id", 100, "DECREMENT", "EXPENSE")).resolves.not.toThrow(AppError)
    })

    it("should propagate error if financeBalanceHistory.create fails", async () => {
        const tx = mockTx({createShouldFail: true})

        vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(tx))

        await expect(adjustBalanceService("random-id", 100, "DECREMENT", "EXPENSE")).rejects.toThrow("DB Error")
    }) 
})