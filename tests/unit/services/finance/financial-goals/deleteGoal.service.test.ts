import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { deleteGoalService } from "../../../../../src/modules/finance/financial-goals/services/deleteGoal.service";
import { Prisma } from "@prisma/client";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

const mockTx = {
  financialGoal: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  goalProgressSnapshot: {
    findFirst: vi.fn(),
  },
};

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
);

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

const goalId = "goalId";
const userId = "userId";

describe("Delete goal service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(mockTx),
    );
  });

  it("should delete goal and refund initial + deposited amount", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      initialAmount: new Prisma.Decimal(100)
    })
    vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue({
      totalDeposited: new Prisma.Decimal(1000)
    })
    vi.mocked(adjustBalanceWithTx).mockResolvedValue({
      balance: new Prisma.Decimal(2000),
    } as any);

    const result = await deleteGoalService(goalId, userId);

    expect(financialGoalsRepository.getUniqueGoal).toHaveBeenCalledWith(mockTx, goalId, userId, { initialAmount: true })
    expect(financialGoalsRepository.getLatestSnapshot).toHaveBeenCalledWith(mockTx, goalId)
    expect(adjustBalanceWithTx).toHaveBeenCalledWith(
      {
        tx: mockTx,
        userId,
        amount: 1100,
        type: "INCREMENT",
        reason: "GOAL_DELETED",
      }
    );
    expect(financialGoalsRepository.deleteGoal).toHaveBeenCalledWith(mockTx, goalId, userId)

    expect(result.refundedAmount).toEqual(new Prisma.Decimal(1100));
    expect(result.newBalance).toEqual(new Prisma.Decimal(2000));
  });

  it("should refund only initial amount when no deposits exist", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      initialAmount: new Prisma.Decimal(100)
    })
    vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue(null)

    const result = await deleteGoalService(goalId, userId);

    expect(result.refundedAmount).toEqual(new Prisma.Decimal(100));
  });

  it("should throw NOT_FOUND when goal does not exist", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue(null)

    await expect(deleteGoalService(goalId, userId)).rejects.toThrow(
      "Financial goal not found",
    );
  });

  it("should propagate error from adjustBalanceWithTx", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
      initialAmount: new Prisma.Decimal(100)
    })
    vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue(null)
    vi.mocked(adjustBalanceWithTx).mockRejectedValue(new Error("Adjust balance helper error"))

    await expect(deleteGoalService(goalId, userId)).rejects.toThrow(
      "Adjust balance helper error",
    );
  })
});
