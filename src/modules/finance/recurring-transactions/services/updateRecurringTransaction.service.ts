import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { updateRecurringTransactionBodyType } from "../schemas/updateRecurringTransaction.schema.js";
import { Prisma } from "@prisma/client";
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";
import { financialCategoriesRepository } from "../../financial-categories/repositories/financialCategories.repository.js";

function getTodayUTC() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function validateDayOfMonth(date: Date, day: number) {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();

  if (day < 1 || day > daysInMonth) {
    throw new AppError(
      "INVALID_DATA",
      "Invalid dayOfMonth for selected month",
      400,
    );
  }
}

export async function updateRecurringTransactionService(
  id: string,
  userId: string,
  data: updateRecurringTransactionBodyType,
) {
  return await prisma.$transaction(async (tx) => {
    const existing = await recurringTransactionRepository.findById(
      tx,
      userId,
      id,
    );

    if (!existing) {
      throw new AppError("NOT_FOUND", "Recurring transaction not found", 404);
    }

    if (data.categoryId !== undefined && data.categoryId !== null) {
      const category = await financialCategoriesRepository.findOneById(
        userId,
        data.categoryId,
      );

      if (!category) {
        throw new AppError("NOT_FOUND", "Category not found", 404);
      }
    }

    const merged = {
      type: data.type ?? existing.type,
      name: data.name ?? existing.name,
      amount: data.amount ?? existing.amount.toNumber(),
      recurrenceValue: data.recurrenceValue ?? existing.recurrenceValue,
      recurrenceUnit: data.recurrenceUnit ?? existing.recurrenceUnit,
      categoryId:
        data.categoryId !== undefined ? data.categoryId : existing.categoryId,
      dayOfMonth: data.dayOfMonth ?? existing.dayOfMonth,
    };

    let nextOccurrence = existing.nextOccurrence;

    if (data.firstOccurrence) {
      nextOccurrence = new Date(data.firstOccurrence);
    }

    if (merged.recurrenceUnit === "MONTH") {
      if (merged.dayOfMonth) {
        validateDayOfMonth(nextOccurrence, merged.dayOfMonth);

        nextOccurrence = new Date(
          Date.UTC(
            nextOccurrence.getUTCFullYear(),
            nextOccurrence.getUTCMonth(),
            merged.dayOfMonth,
          ),
        );
      }
    } else if (merged.dayOfMonth) {
      throw new AppError(
        "INVALID_DATA",
        "dayOfMonth only allowed for monthly recurrence",
        400,
      );
    }

    const today = getTodayUTC();

    if (nextOccurrence < today) {
      throw new AppError(
        "INVALID_DATA",
        "Next occurrence cannot be in the past",
        400,
      );
    }

    try {
      const updated =
        await recurringTransactionRepository.updateRecurringTransaction(
          tx,
          id,
          userId,
          {
            type: merged.type,
            name: merged.name,
            amount: merged.amount,
            recurrenceValue: merged.recurrenceValue,
            recurrenceUnit: merged.recurrenceUnit,
            categoryId: merged.categoryId,
            dayOfMonth: merged.dayOfMonth,
            nextOccurrence,
          },
        );

      if (!updated) {
        throw new AppError("NOT_FOUND", "Recurring transaction not found", 404);
      }

      return updated;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          throw new AppError(
            "DUPLICATE_REGISTER",
            "Recurring transaction already exists",
            409,
          );
        }
      }

      throw err;
    }
  });
}
