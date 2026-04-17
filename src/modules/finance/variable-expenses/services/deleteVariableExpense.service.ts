import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { fetchExpense } from "../helpers/fetchVariableExpense.helper.js";

export async function deleteVariableExpenseService(
  userId: string,
  expenseId: string,
) {
  const { amount } = await fetchExpense(userId, expenseId);

  return await variableExpenseRepository.delete(
    userId,
    expenseId,
    amount.toNumber(),
  );
}
