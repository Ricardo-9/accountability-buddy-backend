import { describe, it, expect, vi, beforeEach } from "vitest";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository"
import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { prisma } from "../../../../../src/lib/prisma";

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financialGoal: {
            findMany: vi.fn()
        }
    }
}))

const mockTx = {
    financialGoal: {
        create: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn()
    },
    goalDeposit: {
        create: vi.fn()
    },
    goalProgressSnapshot: {
        findFirst: vi.fn(),
        create: vi.fn()
    }
} as unknown as Prisma.TransactionClient


describe("Financial goals repository test", () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe("createGoal", () => {
        it("should convert target and initial amount to Prisma.Decimal", async () => {
            const fakeData = {
                userId: "userId",
                name: "Goal name",
                target: 1000,
                initialAmount: 100,
                durationValue: 12,
                durationUnit: DurationUnit.MONTHS,
                style: InvestorStyle.MEDIUM,
                categoryId: null
            }

            await financialGoalsRepository.createGoal(
                mockTx,
                fakeData
            )

            expect(mockTx.financialGoal.create).toHaveBeenCalledWith({
                data: {
                    ...fakeData,
                    target: new Prisma.Decimal(fakeData.target),
                    initialAmount: new Prisma.Decimal(fakeData.initialAmount)
                },
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
                    createdAt: true,
                }
            })
        })
    })

    describe("getGoals", () => {
        it("should filter by categoryId when not null", async () => {
            await financialGoalsRepository.getGoals("userId", "categoryId", 10)

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "userId", deletedAt: null, categoryId: "categoryId" }
                })
            )
        })

        it("should not filter by categoryId when null", async () => {
            await financialGoalsRepository.getGoals("userId", null, 10)

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: "userId", deletedAt: null }
                })
            )
        })

        it("should apply limit + 1 for pagination", async () => {
            await financialGoalsRepository.getGoals("userId", null, 10)

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 11
                })
            )
        })

        it("should apply cursor when provided", async () => {
            await financialGoalsRepository.getGoals("userId", null, 10, "cursor")

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 1,
                    cursor: { id: "cursor" }
                })
            )
        })

        it("should not apply cursor when not provided", async () => {
            await financialGoalsRepository.getGoals("userId", null, 10)

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.not.objectContaining({
                    skip: 1,
                    cursor: expect.anything()
                })
            )
        })

        it("should order by createdAt desc and id desc", async () => {
            await financialGoalsRepository.getGoals("userId", null, 10)

            expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    orderBy: [
                        { createdAt: "desc" },
                        { id: "desc" }
                    ]
                })
            )
        })
    })

    describe("getUniqueGoal", () => {
        it("should call transaction with correct params", async () => {
            const select = {
                id: true,
                target: true,
                createdAt: true
            }

            await financialGoalsRepository.getUniqueGoal(mockTx, "goalId", "userId", select)

            expect(mockTx.financialGoal.findUnique).toHaveBeenCalledWith({
                where: {
                    id: "goalId",
                    userId: "userId",
                    deletedAt: null
                },
                select
            })
        })
    })

    describe("updateGoal", () => {
        const updateGoalData = {
            target: new Prisma.Decimal(1000),
            initialAmount: new Prisma.Decimal(100)
        }

        it("should use required fields", async () => {
            await financialGoalsRepository.updateGoal(
                mockTx,
                "goalId",
                "userId",
                updateGoalData
            )

            expect(mockTx.financialGoal.update).toHaveBeenCalledWith({
                where: { id: "goalId", userId: "userId", deletedAt: null },
                data: expect.objectContaining({
                    target: new Prisma.Decimal(1000),
                    initialAmount: new Prisma.Decimal(100)
                }),
                select: {
                id: true,
                name: true,
                target: true,
                durationValue: true,
                durationUnit: true,
                style: true,
                initialAmount: true,
                createdAt: true,
                updatedAt: true,
                userId: true,
                categoryId: true,
            }
            })
        })

        it("should use categoryId when null (remove category)", async () => {
            await financialGoalsRepository.updateGoal(
                mockTx,
                "goalId",
                "userId",
                { ...updateGoalData, categoryId: null }
            )

            expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        categoryId: null
                    })
                })
            )
        })

        it.each([
            ["categoryId", "categoryId"],
            ["name", "Goal name"],
            ["durationValue", 12],
            ["durationUnit", DurationUnit.MONTHS],
            ["style", InvestorStyle.HIGH]
        ])("should use %s when provided", async (field, value) => {
            await financialGoalsRepository.updateGoal(
                mockTx,
                "goalId",
                "userId",
                { ...updateGoalData, [field]: value }
            )

            expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ [field]: value })
                })
            )
        })

        it.each([
            "categoryId",
            "name",
            "durationValue",
            "durationUnit",
            "style"
        ])("should not use %s when not provided", async (field) => {
            await financialGoalsRepository.updateGoal(
                mockTx,
                "goalId",
                "userId",
                updateGoalData
            )

            expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.not.objectContaining({ [field]: expect.anything() })
                })
            )
        })
    })

    describe("deleteGoal", () => {
        it("should call transaction with correct params", async () => {
            await financialGoalsRepository.deleteGoal(mockTx, "goalId", "userId")

            expect(mockTx.financialGoal.update).toHaveBeenCalledWith({
                where: { id: "goalId", userId: "userId", deletedAt: null },
                data: { deletedAt: expect.any(Date) }
            })
        })
    })

    describe("createDeposit", () => {
        it("should convert amount to Prisma.Decimal", async () => {
            await financialGoalsRepository.createDeposit(
                mockTx,
                "goalId",
                1000
            )

            expect(mockTx.goalDeposit.create).toHaveBeenCalledWith({
                data: {
                    goalId: "goalId",
                    amount: new Prisma.Decimal(1000)
                },
                select: {
                    id: true,
                    goalId: true,
                    amount: true,
                    createdAt: true
                }
            })
        })
    })

    describe("getLatestSnapshot", () => {
        it("should call transaction with correct params", async () => {
            await financialGoalsRepository.getLatestSnapshot(
                mockTx,
                "goalId"
            )

            expect(mockTx.goalProgressSnapshot.findFirst).toHaveBeenCalledWith({
                where: { goalId: "goalId" },
                orderBy: { createdAt: "desc" },
                select: { totalDeposited: true }
            })
        })
    })

    describe("createSnapshot", () => {
        it("should call transaction with correct params", async () => {
            await financialGoalsRepository.createSnapshot(
                mockTx,
                "goalId",
                new Prisma.Decimal(1000)
            )

            expect(mockTx.goalProgressSnapshot.create).toHaveBeenCalledWith({
                data: {
                    goalId: "goalId",
                    totalDeposited: new Prisma.Decimal(1000)
                }
            })
        })
    })
})