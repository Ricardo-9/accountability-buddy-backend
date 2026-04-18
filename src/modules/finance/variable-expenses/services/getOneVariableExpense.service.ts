import { fetchExpense } from "../helpers/fetchVariableExpense.helper.js";

export async function getOneVariableExpenseService(
  userId: string,
  expenseId: string,
) {
  return await fetchExpense(userId, expenseId);
}

