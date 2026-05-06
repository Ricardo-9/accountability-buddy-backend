import { TransactionType } from "@prisma/client";
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";

export async function getRecurringTransactionService(
  userId: string,
  limit = 10,
  cursor?: string,
  type?: TransactionType,
  categoryId?:string,
  startDate?: Date,
  endDate?: Date 

) {
  return recurringTransactionRepository.findManyByUserId(userId, 
    limit,
    cursor,
    type,
    categoryId,
    startDate,
    endDate,
  );
}