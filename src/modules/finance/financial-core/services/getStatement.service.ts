import { financeAccountRepository } from "../repositories/financeAccount.repository.js";

export async function getStatementService(
  userId: string,
  limit = 20,
  startDate?: Date,
  endDate?: Date,
  cursor?: string,
) {
  return await financeAccountRepository.getStatement(
    userId,
    limit,
    startDate,
    endDate,
    cursor
  )
}
