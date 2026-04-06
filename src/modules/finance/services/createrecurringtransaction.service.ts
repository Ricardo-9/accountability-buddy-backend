import { prisma } from "../../../lib/prisma.js";
import { CreateRecurringTransaction } from "../schemas/createrecurringtransaction.schema.js";

export async function createRecurringTransactionService(
    userId: string,
    input: CreateRecurringTransaction
) {
    return await prisma.recurringTransaction.create({
        data: {
            userId,
            type: input.type,
            name: input.name,
            amount: input.amount,
            recurrenceValue: input.recurrenceValue,
            recurrenceUnit: input.recurrenceUnit,
            nextOccurrence: input.firstOccurrence,
            ...(input.categoryId && { categoryId: input.categoryId }),
            ...(input.dayOfMonth && { dayOfMonth: input.dayOfMonth })
        },
        select: {
            id: true,
            userId: true,
            categoryId: true,
            type: true,
            name: true,
            amount: true,
            recurrenceValue: true,
            recurrenceUnit: true,
            dayOfMonth: true,
            createdAt: true,
            nextOccurrence: true
        }
    })
}