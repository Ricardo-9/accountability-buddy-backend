import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma"
import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { getGoalsService } from "../../../../../src/modules/finance/services/getgoals.service"

vi.mock("../../../../../src/lib/prisma", () => ({
    prisma: {
        financialCategory: {
            findFirst: vi.fn()
        },
        financialGoal: {
            findMany: vi.fn()
        }
    }
}))

const mockGoals = [
    {
        id: "0611d847-f9ca-4f0e-9b34-33b9250b42fe",
        userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
        categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd0",
        name: "checkup",
        target: new Prisma.Decimal(500),
        initialAmount: new Prisma.Decimal(0),
        durationValue: 12,
        durationUnit: DurationUnit.WEEKS,
        style: InvestorStyle.MEDIUM,
        createdAt: new Date("2026-03-28T16:21:32.613Z"),
        updatedAt: new Date("2026-03-28T16:21:32.613Z"),
        deletedAt: null
    },
    {
        id: "86e5d547-2523-4b77-a31e-7220d68d62a4",
        userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
        categoryId: "942c2acc-a35d-4127-a5d2-7fdfd9a60689",
        name: "buy a course",
        target: new Prisma.Decimal(200),
        initialAmount: new Prisma.Decimal(0),
        durationValue: 120,
        durationUnit: DurationUnit.MONTHS,
        style: InvestorStyle.MEDIUM,
        createdAt: new Date("2026-03-28T16:20:22.878Z"),
        updatedAt: new Date("2026-03-28T16:20:22.878Z"),
        deletedAt: null
    },
    {
        id: "8c4ab071-fd20-444a-8bd3-f39e1dbe4a00",
        userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
        categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
        name: "buy a farm",
        target: new Prisma.Decimal(10000000),
        initialAmount: new Prisma.Decimal(1000),
        durationValue: 120,
        durationUnit: DurationUnit.MONTHS,
        style: InvestorStyle.MEDIUM,
        createdAt: new Date("2026-03-27T16:11:22.487Z"),
        updatedAt: new Date("2026-03-27T16:11:22.487Z"),
        deletedAt: null
    },
    {
        id: "2ddb9a9e-5b0b-4b58-b762-7a683773a033",
        userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
        categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
        name: "buy a house",
        target: new Prisma.Decimal(10000000),
        initialAmount: new Prisma.Decimal(1000),
        durationValue: 120,
        durationUnit: DurationUnit.MONTHS,
        style: InvestorStyle.MEDIUM,
        createdAt: new Date("2026-03-26T22:20:36.802Z"),
        updatedAt: new Date("2026-03-26T22:20:36.802Z"),
        deletedAt: null
    }
]

const userId = "07c7db0b-8c87-4bc6-853b-1327afa6b262"

describe("Get financial goals service test", () => {
    beforeEach(() => vi.clearAllMocks())

    it("should return goals", async () => {
        vi.mocked(prisma.financialGoal.findMany).mockResolvedValue(mockGoals)

        const result = await getGoalsService(userId, null)

        expect(result).toEqual(mockGoals)
    })

    it("should always filter by userId", async () => {
        await getGoalsService(userId, null)

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId, deletedAt: null }
            })
        )
    })

    it("should filter by category when provided", async () => {
        vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue({ id: "c478795a-9215-4c25-9e7b-eefdc242b429" } as any)
        await getGoalsService(userId, "c478795a-9215-4c25-9e7b-eefdc242b429")

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    userId,
                    deletedAt: null,
                    categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429"
                }
            })
        )
    })

    it("should not filter by category when null", async () => {
        await getGoalsService(userId, null)

        expect(prisma.financialCategory.findFirst).not.toHaveBeenCalled()
        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId, deletedAt: null }
            })
        )
    })

    it("should throw if category is not valid", async () => {
        vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null)

        await expect(getGoalsService(userId, "invalid-category"))
            .rejects.toThrow("Category not found")
    })

    it("should apply limit + 1 for pagination", async () => {
        await getGoalsService(userId, null, 12)

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                take: 12 + 1
            })
        )
    })

    it("should apply cursor when provided", async () => {
        await getGoalsService(userId, null, 12, "86e5d547-2523-4b77-a31e-7220d68d62a4")

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skip: 1,
                cursor: { id: "86e5d547-2523-4b77-a31e-7220d68d62a4" }
            })
        )
    })

    it("should not apply cursor when it is not provided", async () => {
        await getGoalsService(userId, null, 12)

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.not.objectContaining({
                skip: 1,
                cursor: expect.anything()
            })
        )
    })

    it("should order by createdAt desc and id desc", async () => {
        await getGoalsService(userId, null, 12)

        expect(prisma.financialGoal.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" }
                ]
            })
        )
    })

    it("should return an empty array when no goals found", async () => {
        vi.mocked(prisma.financialGoal.findMany).mockResolvedValue([])

        const result = await getGoalsService(userId, null)

        expect(result).toEqual([])
    })
})