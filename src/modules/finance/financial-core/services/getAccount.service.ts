import { financeAccountRepository } from "../repositories/financeAccount.repository.js";

export async function getAccountService(userId: string) {
  return await financeAccountRepository.getAccount(userId)
}
