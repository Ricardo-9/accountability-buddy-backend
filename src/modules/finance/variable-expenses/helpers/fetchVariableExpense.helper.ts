import { VariableExpense } from "@prisma/client";
import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";
import { AppError } from "../../../../core/errors/AppError.js";

export async function fetchExpense(
  userId: string,
  expenseId: string,
): Promise<VariableExpense> {
  const expense = await variableExpenseRepository.findOneById(
    userId,
    expenseId,
  );

  if (!expense) {
    throw new AppError("NOT_FOUND", "variable expense not found", 404);
  }

  return expense;
}