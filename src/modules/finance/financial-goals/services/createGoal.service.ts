import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { prisma } from "../../../../lib/prisma.js";
import { adjustBalanceWithTx } from "../../shared/helpers/adjustBalanceWithTx.helper.js";
import { financialGoalsRepository } from "../repositories/financialGoals.repository.js";
import { ensureCategoryExists } from "../../shared/helpers/ensureCategoryExists.helper.js";

export async function createGoalService(
  userId: string,
  name: string,
  target: number,
  initialAmount: number,
  durationValue: number,
  durationUnit: DurationUnit,
  style: InvestorStyle,
  categoryId: string | null,
) {
  return prisma.$transaction(async (tx) => {
    await ensureCategoryExists(tx, userId, categoryId)

    const goal = await financialGoalsRepository.createGoal(tx, {
      userId,
      name,
      target,
      initialAmount,
      durationValue,
      durationUnit,
      style,
      categoryId
    })

    const newBalance = await adjustBalanceWithTx({
      tx,
      userId,
      amount: initialAmount,
      type: "DECREMENT",
      reason: "GOAL_CREATE",
    });

    return {
      goal,
      newBalance: newBalance.balance,
    };
  });
}
