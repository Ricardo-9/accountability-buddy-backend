import { prisma } from "../../../../lib/prisma.js";
import { ensureCategoryExists } from "../../shared/helpers/ensureCategoryExists.helper.js";
import { recurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";
import { CreateRecurringTransaction } from "../schemas/createRecurringTransaction.schema.js";

export async function createRecurringTransactionService(
  userId: string,
  input: CreateRecurringTransaction,
) {
  if (input.categoryId) await ensureCategoryExists(prisma, userId, input.categoryId)

  const { firstOccurrence, ...rest } = input

  return recurringTransactionRepository.createRecurringTransaction(prisma, userId, {
    ...rest,
    nextOccurrence: firstOccurrence,
  })
}
