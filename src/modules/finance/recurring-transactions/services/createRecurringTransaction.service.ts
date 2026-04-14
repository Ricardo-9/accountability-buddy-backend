import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { CreateRecurringTransaction } from "../schemas/createRecurringTransaction.schema.js";

export async function createRecurringTransactionService(
  userId: string,
  input: CreateRecurringTransaction,
) {
  if (input.categoryId) {
    const category = await prisma.financialCategory.findFirst({
      where: { id: input.categoryId, userId },
      select: { id: true },
    });

    if (!category) throw new AppError("NOT_FOUND", "Category not found", 404);
  }

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
      ...(input.dayOfMonth && { dayOfMonth: input.dayOfMonth }),
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
      nextOccurrence: true,
    },
  });
}
