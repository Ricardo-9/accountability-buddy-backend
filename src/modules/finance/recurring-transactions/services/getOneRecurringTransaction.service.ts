import { prisma } from "../../../../lib/prisma.js";
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";
import { AppError } from "../../../../core/errors/AppError.js";

export async function getOneRecurringTransactionService(
  userId: string,
  id: string,
) {
  const recurring = await recurringTransactionRepository.findById(
    prisma,
    userId, 
    id,
  );

  if (!recurring) {
    throw new AppError("NOT_FOUND", "Recurring transaction not found", 404);
  }

  return recurring; 
}