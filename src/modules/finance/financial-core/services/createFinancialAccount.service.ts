import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { AppError } from "../../../../core/errors/AppError.js";
import { financeAccountRepository } from "../repositories/financeAccount.repository.js";

export async function createFinancialAccountService(
  userId: string,
  balance: number,
) {
  try {
    const account = await financeAccountRepository.createFinancialAccount(
      userId,
      balance
    )

    return account;
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === "P2002")
      throw new AppError(
        "DUPLICATE_REGISTER",
        "User already has an account",
        409,
      );

    throw err;
  }
}
