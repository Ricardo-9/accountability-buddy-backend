import { getRecurringTransactionType } from "../schemas/getrecurringtransaction.schema.js";
import { prisma } from "../../../lib/prisma.js";

export async function getRecurringTransactionService(
  userId: string,
  data: getRecurringTransactionType,
) {
  const skip = (data.page - 1) * data.limit;

  const recurringTransactions = await prisma.recurringTransaction.findMany({
    where: {
      userId,
      ...(data.type && { type: data.type }),
      ...(data.categoryId && { categoryId: data.categoryId }),
      ...((data.startDate || data.endDate) && {
        nextOccurrence: {
          ...(data.startDate && { gte: data.startDate }),
          ...(data.endDate && { lte: data.endDate }),
        },
      }),
    },
    skip: skip,
    take: data.limit,
    orderBy: { nextOccurrence: data.order ?? "asc" },
  });

  return recurringTransactions;
}
