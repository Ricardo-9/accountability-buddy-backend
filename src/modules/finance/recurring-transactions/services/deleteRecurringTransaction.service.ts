import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";

export async function deleteRecurringTransactionService(
  id: string,
  userId: string,
) {
  const deletedTransaction = await recurringTransactionRepository.deleteRecurringTransaction(prisma, userId, id)

  if (deletedTransaction.count === 0)
    throw new AppError("NOT_FOUND", "Transaction not found", 404);
}
