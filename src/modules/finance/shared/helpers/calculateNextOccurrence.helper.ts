import { RecurringTransaction } from "@prisma/client";
import { AppError } from "../../../core/errors/AppError.js";

export function calculateNextOccurrence(transaction: RecurringTransaction) {
  function addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  function addMonths(date: Date, months: number, dayOfMonth: number) {
    const year = date.getFullYear();
    const month = date.getMonth() + months;

    const result = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    result.setDate(Math.min(dayOfMonth, lastDayOfMonth));

    return result;
  }

  const baseDate = transaction.nextOccurrence;

  switch (transaction.recurrenceUnit) {
    case "DAY":
      return addDays(baseDate, transaction.recurrenceValue);
    case "WEEK":
      return addDays(baseDate, transaction.recurrenceValue * 7);
    case "MONTH":
      if (!transaction.dayOfMonth)
        throw new AppError(
          "API_ERROR",
          "dayOfMonth is required for MONTH recurrence",
        );
      return addMonths(
        baseDate,
        transaction.recurrenceValue,
        transaction.dayOfMonth,
      );
    default:
      throw new AppError("API_ERROR", "Unsupported recurrence unit");
  }
}
