import { prisma } from "../../../../lib/prisma.js";

export async function getStatementService(
  userId: string,
  startDate?: Date,
  endDate?: Date,
  limit = 20,
  cursor?: string,
) {
  const statement = await prisma.financeBalanceHistory.findMany({
    where: {
      userId,
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate && { gte: startDate }),
              ...(endDate && { lte: endDate }),
            },
          }
        : {}),
    },
    select: {
      id: true,
      balance: true,
      change: true,
      type: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });

  return statement;
}
