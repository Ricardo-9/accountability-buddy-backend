import { AppError } from "../../../../core/errors/AppError.js";
import { prisma } from "../../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";
import { financialGoalsRepository } from "../repositories/financialGoals.repository.js";

export async function deleteGoalService(id: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const goal = await financialGoalsRepository.getUniqueGoal(tx, id, userId, { initialAmount: true })

    if (!goal) throw new AppError("NOT_FOUND", "Financial goal not found", 404);

    const deposit = await financialGoalsRepository.getLatestSnapshot(tx, id)

    const refundedAmount = goal.initialAmount.plus(
      deposit?.totalDeposited ?? 0,
    );

    const updateBalance = await adjustBalanceWithTx({
      tx,
      userId,
      amount: Number(refundedAmount),
      type: "INCREMENT",
      reason: "GOAL_DELETED",
    });

    await financialGoalsRepository.deleteGoal(tx, id, userId)

    return {
      refundedAmount,
      newBalance: updateBalance.balance,
    };
  });
}
