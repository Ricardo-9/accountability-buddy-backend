import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { deleteGoalService } from "../../../../../src/modules/finance/financial-goals/services/deleteGoal.service";
import { Prisma } from "@prisma/client";

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
    mockTx.financialGoal.findUnique.mockResolvedValue({
      initialAmount: new Prisma.Decimal(100),
    });
    mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({
      totalDeposited: new Prisma.Decimal(1000),
    });
    vi.mocked(adjustBalanceWithTx).mockResolvedValue({
      balance: new Prisma.Decimal(2000),
    } as any);

    const result = await deleteGoalService(goalId, userId);

    expect(adjustBalanceWithTx).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1100,
        type: "INCREMENT",
        reason: "GOAL_DELETED",
      }),
    );
    expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: goalId, userId, deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      }),
    );
    expect(result.refundedAmount).toEqual(new Prisma.Decimal(1100));
    expect(result.newBalance).toEqual(new Prisma.Decimal(2000));
  });

  it("should refund only initial amount when no deposits exist", async () => {
    mockTx.financialGoal.findUnique.mockResolvedValue({
      initialAmount: new Prisma.Decimal(100),
    });
    mockTx.goalProgressSnapshot.findFirst.mockResolvedValue(null);
    vi.mocked(adjustBalanceWithTx).mockResolvedValue({
      balance: new Prisma.Decimal(2000),
    } as any);

    const result = await deleteGoalService(goalId, userId);

    expect(result.refundedAmount).toEqual(new Prisma.Decimal(100));
  });

  it("should throw NOT_FOUND when goal does not exist", async () => {
    mockTx.financialGoal.findUnique.mockResolvedValue(null);

    await expect(deleteGoalService(goalId, userId)).rejects.toThrow(
      "Financial goal not found",
    );
  });
});
