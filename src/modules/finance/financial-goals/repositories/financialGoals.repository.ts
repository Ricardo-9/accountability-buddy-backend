import { Prisma, DurationUnit, InvestorStyle } from "@prisma/client";

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
    }
}