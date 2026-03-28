import { describe, it, expect, beforeEach, vi } from "vitest";
import { getStatementService } from "../../../../../src/modules/finance/services/getstatement.service"
import { prisma } from "../../../../../src/lib/prisma";
import { AppError } from "../../../../../src/core/errors/AppError"; import { FinanceBalanceHistory } from "@prisma/client";
7

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financeBalanceHistory: {
            findMany: vi.fn()
        }
    }
}))

describe("Get statement service test", () => {
    beforeEach(() => vi.clearAllMocks())

    const mockStatement = [
        { id: "stt1", balance: "3000", change: "3000", type: "INITIAL_BALANCE", createdAt: new Date("2026-03-20") },
        { id: "stt2", balance: "3500", change: "3500", type: "INCOME", createdAt: new Date("2026-03-21") },
        { id: "stt3", balance: "2000", change: "-1500", type: "EXPENSE", createdAt: new Date("2026-03-22") }
    ] as unknown as FinanceBalanceHistory[]

    describe("Basic search", () => {
        it("should return user's statement without filters", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            const result = await getStatementService("random-id")

            expect(result).toEqual(mockStatement)
            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "random-id" },
                    take: 20
                })
            )
        })
    })

    describe("Date filters", () => {
        it("should only apply startDate filter", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
            const startDate = new Date("2026-03-21")

            await getStatementService("random-id", startDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "random-id",
                        createdAt: {
                            gte: startDate
                        }
                    }
                })
            )
        })

        it("should only apply endDate filter", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
            const endDate = new Date("2026-03-21")

            await getStatementService("random-id", undefined, endDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "random-id",
                        createdAt: {
                            lte: endDate
                        }
                    }
                })
            )
        })

        it("should apply startDate and endDate filters", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
            const startDate = new Date("2026-03-21")
            const endDate = new Date("2026-03-22")

            await getStatementService("random-id", startDate, endDate)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: {
                        userId: "random-id",
                        createdAt: {
                            gte: startDate,
                            lte: endDate
                        }
                    }
                })
            )
        })

        it("should not apply date filters when both startDate and endDate are missing", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            await getStatementService("random-id")

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "random-id" },
                    take: 20
                })
            )
        })
    })

    describe("Pagination", () => {
        it("should use the default limit of 20", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            await getStatementService("random-id")

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 20 })
            )
        })

        it("should use a custom limit", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
            const limit = 10

            await getStatementService("random-id", undefined, undefined, limit)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 10 })
            )
        })

        it("should apply cursor if it is provided", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)
            const cursor = "cursor-id"

            await getStatementService("random-id", undefined, undefined, 20, cursor)

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 1,
                    cursor: { id: cursor }
                })
            )
        })

        it("should not apply cursor if it is not provided", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            await getStatementService("random-id")

            const call = vi.mocked(prisma.financeBalanceHistory.findMany).mock.calls[0][0]
            expect(call?.skip).toBeUndefined()
            expect(call?.cursor).toBeUndefined()
        })
    })

    describe("Sorting and selection", () => {
        it("should sorting by createdAt desc", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            await getStatementService("random-id")

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: {
                        createdAt: "desc"
                    }
                })
            )
        })

        it("should select only the expected fields", async () => {
            vi.mocked(prisma.financeBalanceHistory.findMany).mockResolvedValue(mockStatement)

            await getStatementService("random-id")

            expect(prisma.financeBalanceHistory.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    select: {
                        id: true,
                        balance: true,
                        change: true,
                        type: true,
                        createdAt: true
                    }
                })
            )
        })
    })
}) 