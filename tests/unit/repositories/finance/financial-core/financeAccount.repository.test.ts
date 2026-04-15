import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { financeAccountRepository } from "../../../../../src/modules/finance/financial-core/repositories/financeAccount.repository";
import { Prisma } from "@prisma/client";
import { DEFAULT_FINANCIAL_CATEGORIES } from "../../../../../src/modules/finance/consts/defaultFinancialCategories";
import { FinanceBalanceHistory } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        $transaction: vi.fn(),
        financeAccount: {
            create: vi.fn(),
            findUnique: vi.fn()
        },
        financeBalanceHistory: {
            create: vi.fn(),
            findMany: vi.fn()
        },
        financialCategory: { createMany: vi.fn() }
    }
}))

const userId = "random-id";
const balance = 10000;

const mockAccount = {
    id: "account-id",
    userId,
    balance: new Prisma.Decimal(balance),
    createdAt: new Date(),
};

describe("Finance account repository test", () => {
    beforeEach(() => vi.clearAllMocks())
    describe("getAccount", () => {
        it("should call prisma with correct params", async () => {
            const updatedAt = new Date()

            vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({ ...mockAccount, updatedAt })

            const result = await financeAccountRepository.getAccount(userId)

            expect(result).toEqual({ ...mockAccount, updatedAt })
            expect(prisma.financeAccount.findUnique).toHaveBeenCalledWith({
                where: { userId },
                select: {
                    id: true,
                    userId: true,
                    balance: true,
                    createdAt: true,
                    updatedAt: true
                }
            })
        })
    })

    describe("getAccountBalance", () => {
        it("should call tx.financeAccount with correct params", async () => {
            const mockFindUnique = vi.fn().mockResolvedValue({ balance })

            const txMock = {
                financeAccount: {
                    findUnique: mockFindUnique
                }
            } as any

            const result = await financeAccountRepository.getAccountBalance(txMock, userId)

            expect(result).toEqual({ balance })
            expect(mockFindUnique).toHaveBeenCalledWith({
                where: { userId },
                select: { balance: true }
            })
        })

        it("should return null if account does not exist", async () => {
            const txMock = {
                financeAccount: {
                    findUnique: vi.fn().mockResolvedValue(null)
                }
            } as any

            const result = await financeAccountRepository.getAccountBalance(txMock, "userId")

            expect(result).toBeNull()
        })
    })
    describe("createFinancialAccount", () => {
        it("should call prisma transaction with financialAccount.create, financeBalanceHistory.create and financialCategory.createMany", async () => {
            const createMock = vi.fn();
            const historyMock = vi.fn();
            const categoryMock = vi.fn();

            vi.mocked(prisma.financeAccount.create).mockReturnValue(createMock() as any);
            vi.mocked(prisma.financeBalanceHistory.create).mockReturnValue(historyMock() as any);
            vi.mocked(prisma.financialCategory.createMany).mockReturnValue(categoryMock() as any);

            vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount]);

            await financeAccountRepository.createFinancialAccount(userId, balance);

            expect(prisma.financeAccount.create).toHaveBeenCalled();
            expect(prisma.financeBalanceHistory.create).toHaveBeenCalled();
            expect(prisma.financialCategory.createMany).toHaveBeenCalled();
        });

        it("should call financialAccount.create with correct params", async () => {
            vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount]);

            await financeAccountRepository.createFinancialAccount(userId, balance);

            expect(prisma.financeAccount.create).toHaveBeenCalledWith({
                data: { userId, balance },
                select: {
                    id: true,
                    userId: true,
                    balance: true,
                    createdAt: true
                }
            })
        })

        it("should call financeBalanceHistory.create with correct params", async () => {
            vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount]);

            await financeAccountRepository.createFinancialAccount(userId, balance);

            expect(prisma.financeBalanceHistory.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    balance,
                    change: balance,
                    type: "INITIAL_BALANCE"
                }
            })
        })

        it("should call financialCategory.createMany with correct params", async () => {
            vi.mocked(prisma.$transaction).mockResolvedValueOnce([mockAccount]);

            await financeAccountRepository.createFinancialAccount(userId, balance);

            expect(prisma.financialCategory.createMany).toHaveBeenCalledWith({
                data: DEFAULT_FINANCIAL_CATEGORIES.map((name) => ({
                    userId,
                    name,
                    isDefault: true
                })),
                skipDuplicates: true
            })
        })
    })

    describe("getStatement", () => {
        it("should fetch statement without filters", async () => {
            await financeAccountRepository.getStatement("userId", 10)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith({
                where: { userId: "userId" },
                select: {
                    id: true,
                    balance: true,
                    change: true,
                    type: true,
                    createdAt: true
                },
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ],
                take: 11
            })
        })

        it("should apply startDate filter", async () => {
            const startDate = new Date("2026-03-22")

            await financeAccountRepository.getStatement("userId", 10, startDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "userId",
                        createdAt: { gte: startDate }
                    }
                })
            )
        })

        it("should apply endDate filter", async () => {
            const endDate = new Date("2026-03-21")

            await financeAccountRepository.getStatement("userId", 10, undefined, endDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "userId",
                        createdAt: { lte: endDate }
                    }
                })
            )
        })

        it("should apply endDate and startDate filter", async () => {
            const startDate = new Date("2026-03-22")
            const endDate = new Date("2026-03-24")

            await financeAccountRepository.getStatement("userId", 10, startDate, endDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "userId",
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                })
            )
        })

        it("should apply cursor pagination", async () => {
            await financeAccountRepository.getStatement("userId", 10, undefined, undefined, "cursorId")

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 1,
                    cursor: { id: "cursorId" }
                })
            )
        })

        it("should request limit + 1 items", async () => {
            await financeAccountRepository.getStatement("userId", 10)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 11
                })
            )
        })
    })
})