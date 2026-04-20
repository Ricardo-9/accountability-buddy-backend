import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";
import { financialGoalsRepository } from "../repositories/financialGoals.repository.js";

export async function goalDepositService(
  id: string,
  userId: string,
  amount: number,
) {
  return await prisma.$transaction(async (tx) => {
    const goal = await financialGoalsRepository.getUniqueGoal(tx, id, userId, { id: true })

    if (!goal) throw new AppError("NOT_FOUND", "Financial goal not found", 404);

    const deposit = await financialGoalsRepository.createDeposit(tx, id, amount)

    const updatedBalance = await adjustBalanceWithTx({
      tx,
      userId,
      amount,
      type: "DECREMENT",
      reason: "GOAL_DEPOSIT",
    });

    const latestSnapshot = await financialGoalsRepository.getLatestSnapshot(tx, id)

    const newTotal = latestSnapshot
      ? latestSnapshot.totalDeposited.plus(deposit.amount)
      : deposit.amount;

    await financialGoalsRepository.createSnapshot(tx, id, newTotal)

    return {
      deposit,
      newBalance: updatedBalance.balance,
    };
  });
}
