import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { GetVariableExpensesQueryType } from "../schemas/getVariableExpenses.schema.js";

export async function getVariableExpensesService(
  userId: string,
  filters: GetVariableExpensesQueryType,
) {
  return await variableExpenseRepository.findManyById(userId, filters);
}
