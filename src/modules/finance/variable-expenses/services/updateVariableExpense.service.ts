import { variableExpenseRepository } from "../repositories/variableExpenses.repository.js";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../../core/errors/AppError.js";
import { updateVariableExpenseType } from "../schemas/updateVariableExpense.schema.js";
import { fetchExpense } from "../helpers/fetchVariableExpense.helper.js";

export async function updateVariableExpenseService(
  userId: string,
  expenseId: string,
  data: updateVariableExpenseType,
) {
  const current = await fetchExpense(userId, expenseId);

  let typeOfTransaction: "DECREMENT" | "INCREMENT" = "DECREMENT";
  let reasonOftransation: "INCOME" | "EXPENSE" = "EXPENSE";
  let amountToAdjust = data.amount;

  if (data.amount !== undefined) {
    const currentAmount = current.amount.toNumber();
    const newAmount = data.amount;
    const diff = newAmount - currentAmount;

    if (diff > 0) {
      typeOfTransaction = "DECREMENT";
      reasonOftransation = "EXPENSE";
      amountToAdjust = diff;
    } else if (diff < 0) {
      typeOfTransaction = "INCREMENT";
      reasonOftransation = "INCOME";
      amountToAdjust = Math.abs(diff);
    } else {
      amountToAdjust = undefined;
    }
  }

  try {
    return await variableExpenseRepository.update(
      userId,
      expenseId,
      data,
      amountToAdjust,
      typeOfTransaction,
      reasonOftransation,
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2003"
    ) {
      throw new AppError("INVALID_REFERENCE", "Category not found", 404);
    }
    throw err;
  }
}
