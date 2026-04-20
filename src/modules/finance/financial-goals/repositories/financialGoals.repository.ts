import { Prisma, DurationUnit, InvestorStyle } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";

export const financialGoalsRepository = {
    async createGoal(tx: Prisma.TransactionClient, data: {
        userId: string,
        name: string,
        target: number,
        initialAmount: number,
        durationValue: number,
        durationUnit: DurationUnit,
        style: InvestorStyle,
        categoryId: string | null,
    }) {
        return await tx.financialGoal.create({
            data: {
                ...data,
                target: new Prisma.Decimal(data.target),
                initialAmount: new Prisma.Decimal(data.initialAmount)
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
    },

    async getGoals(
        userId: string,
        categoryId: string | null,
        limit: number,
        cursor?: string
    ) {
        return await prisma.financialGoal.findMany({
            where: {
                userId,
                deletedAt: null,
                ...(categoryId && { categoryId })
            },
            select: {
                id: true,
                userId: true,
                categoryId: true,
                name: true,
                target: true,
                initialAmount: true,
                durationValue: true,
                durationUnit: true,
                style: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" }
            ],
            take: limit + 1,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor }
            })
        })
    },

    async getUniqueGoal<T extends Prisma.FinancialGoalSelect>(
        tx: Prisma.TransactionClient,
        goalId: string,
        userId: string,
        select: T
    ) {
        return await tx.financialGoal.findUnique({
            where: { id: goalId, userId, deletedAt: null },
            select
        })
    },

    async updateGoal(
        tx: Prisma.TransactionClient,
        goalId: string,
        userId: string,
        target: Prisma.Decimal,
        initialAmount: Prisma.Decimal,
        categoryId?: string | null,
        name?: string,
        durationValue?: number,
        durationUnit?: DurationUnit,
        style?: InvestorStyle,
    ) {
        return await tx.financialGoal.update({
            where: { id: goalId, userId, deletedAt: null },
            data: {
                target,
                initialAmount,
                ...(categoryId !== undefined && { categoryId }),
                ...(name !== undefined && { name }),
                ...(durationValue !== undefined && { durationValue }),
                ...(durationUnit !== undefined && { durationUnit }),
                ...(style !== undefined && { style }),
            }
        })
    },

    async deleteGoal(
        tx: Prisma.TransactionClient,
        goalId: string,
        userId: string,
    ) {
        await tx.financialGoal.update({
            where: { id: goalId, userId, deletedAt: null },
            data: {
                deletedAt: new Date()
            }
        })
    },

    async createDeposit(
        tx: Prisma.TransactionClient,
        goalId: string,
        amount: number
    ) {
        return await tx.goalDeposit.create({
            data: {
                goalId,
                amount: new Prisma.Decimal(amount)
            },
            select: {
                id: true,
                goalId: true,
                amount: true,
                createdAt: true
            }
        })
    },

    async getLatestSnapshot(
        tx: Prisma.TransactionClient,
        goalId: string
    ) {
        return await tx.goalProgressSnapshot.findFirst({
            where: { goalId },
            orderBy: { createdAt: "desc" },
            select: { totalDeposited: true }
        })
    },

    async createSnapshot(
        tx: Prisma.TransactionClient,
        goalId: string,
        totalDeposited: Prisma.Decimal
    ) {
        await tx.goalProgressSnapshot.create({
            data: {
                goalId,
                totalDeposited
            }
        })
    }
}