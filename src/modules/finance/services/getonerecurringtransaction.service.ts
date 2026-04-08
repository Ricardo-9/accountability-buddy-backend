import { prisma } from "../../../lib/prisma.js";

export async function getOneRecurringTransactionService(
  userId: string,
  id: string,
) {
  return await prisma.recurringTransaction.findUnique({
    where: { userId, id },
    select: {
      id: true,
      userId: true,
      categoryId: true,
      type: true,
      name: true,
      amount: true,
      recurrenceValue: true,
      recurrenceUnit: true,
      dayOfMonth: true,
      createdAt: true,
      nextOccurrence: true,
    },
  });
}
