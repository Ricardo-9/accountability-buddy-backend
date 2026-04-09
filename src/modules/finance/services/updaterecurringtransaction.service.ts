import { AppError } from "../../../core/errors/AppError.js";
import { prisma } from "../../../lib/prisma.js";
import { updateRecurringTransactionBodyType } from "../schemas/updaterecurringtransaction.schema.js";

export async function updateRecurringTransactionService(
  id: string,
  userId: string,
  data: updateRecurringTransactionBodyType,
) {
  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "Recurring transaction not found", 404);
  }

  if (data.categoryId) {
    const category = await prisma.financialCategory.findFirst({
      where: {
        id: data.categoryId,
        userId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (!category) {
      throw new AppError("NOT_FOUND", "Category not found", 404);
    }
  }

  const merged = {
    type: data.type ?? existing.type,
    name: data.name ?? existing.name,
    amount: data.amount ?? existing.amount,
    recurrenceValue: data.recurrenceValue ?? existing.recurrenceValue,
    recurrenceUnit: data.recurrenceUnit ?? existing.recurrenceUnit,
    categoryId: data.categoryId ?? existing.categoryId,
    dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth,
  };

  let nextOccurrence = existing.nextOccurrence;

  if (data.firstOccurrence) {
    nextOccurrence = data.firstOccurrence;
  }

  if (merged.recurrenceUnit === "MONTH" && merged.dayOfMonth) {
    const date = new Date(nextOccurrence);
    date.setDate(merged.dayOfMonth);
    nextOccurrence = date;
  }

  if (merged.recurrenceUnit !== "MONTH" && merged.dayOfMonth) {
    throw new AppError(
      "INVALID_DATA",
      "dayOfMonth only allowed for monthly recurrence",
      400,
    );
  }

  if (nextOccurrence < new Date()) {
    throw new AppError(
      "INVALID_DATA",
      "Next occurrence cannot be in the past",
      400,
    );
  }

  if (
    merged.recurrenceUnit === "MONTH" &&
    merged.dayOfMonth &&
    nextOccurrence.getDate() !== merged.dayOfMonth
  ) {
    throw new AppError("INVALID_DATA", "Occurrence must match dayOfMonth", 400);
  }

  return await prisma.recurringTransaction.update({
    where: { id },
    data: {
      type: merged.type,
      name: merged.name,
      amount: merged.amount,
      recurrenceValue: merged.recurrenceValue,
      recurrenceUnit: merged.recurrenceUnit,
      categoryId: merged.categoryId,
      dayOfMonth: merged.dayOfMonth,
      nextOccurrence,
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
      nextOccurrence: true,
      updatedAt: true,
    },
  });
}
