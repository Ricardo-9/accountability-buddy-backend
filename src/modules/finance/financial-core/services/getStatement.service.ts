import { financeAccountRepository } from "../repositories/financeAccount.repository.js";

export async function getStatementService(
  userId: string,
  limit = 20,
  startDate?: Date,
  endDate?: Date,
  cursor?: string,
) {
  const statement = await financeAccountRepository.getStatement(
    userId,
    limit,
    startDate,
    endDate,
    cursor
  )

  const hasNextPage = statement.length > limit;
  const data = hasNextPage ? statement.slice(0, -1) : statement;

  const nextCursor = hasNextPage ? data.at(-1)?.id : null;

  return { statement: data, nextCursor}
}
