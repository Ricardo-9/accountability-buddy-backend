import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";

export async function getVariableExpensesService(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  categoryId?: string,
  limit = 10,
  cursor?: string,
) {
  return variableExpenseRepository.findManyById(
    userId,
    startDate,
    endDate,
    categoryId,
    limit,
    cursor,
  );
}