import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { goalDepositService } from "../../../../../src/modules/finance/financial-goals/services/goalDeposit.service";
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
  },
  goalDeposit: {
    create: vi.fn(),
  },
  goalProgressSnapshot: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
);

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

const goalId = "goalId";
const userId = "userId";

const mockDeposit = {
  id: "deposit-id",
  goalId,
  userId,
  amount: new Prisma.Decimal(1000),
  createdAt: new Date(),
};

describe("Goal deposit service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(mockTx),
    );
  });

  it("should create deposit, update balance and snapshot", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({ id: goalId })
    vi.mocked(financialGoalsRepository.createDeposit).mockResolvedValue(mockDeposit)
    vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue({
      totalDeposited: new Prisma.Decimal(100),
    });
    vi.mocked(adjustBalanceWithTx).mockResolvedValue({ balance: 2000 } as any);

    const result = await goalDepositService(goalId, userId, 1000);

    expect(result).toEqual({
      deposit: mockDeposit,
      newBalance: 2000,
    });
    expect(financialGoalsRepository.getUniqueGoal).toHaveBeenCalledWith(mockTx, goalId, userId, { id: true })
    expect(adjustBalanceWithTx).toHaveBeenCalledWith(
      {
        tx: mockTx,
        userId,
        amount: 1000,
        type: "DECREMENT",
        reason: "GOAL_DEPOSIT",
      }
    );
    expect(financialGoalsRepository.getLatestSnapshot).toHaveBeenCalledWith(mockTx, goalId)
    expect(financialGoalsRepository.createSnapshot).toHaveBeenCalledWith(mockTx, goalId, new Prisma.Decimal(1100))
  });

  it("should throw if goal does not exist", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue(null)

    await expect(goalDepositService(goalId, userId, 1000)).rejects.toThrow(
      "Financial goal not found",
    );
  });

  it("should create first snapshot with amount", async () => {
    vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({ id: goalId })
    vi.mocked(financialGoalsRepository.createDeposit).mockResolvedValue(mockDeposit)
    vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue(null);
    vi.mocked(adjustBalanceWithTx).mockResolvedValue({ balance: 2000 } as any);

    await goalDepositService(goalId, userId, 1000);

    expect(financialGoalsRepository.createSnapshot).toHaveBeenCalledWith(mockTx, goalId, new Prisma.Decimal(1000))
  });
})

it("should call adjustBalanceWithTx with type = 'DECREMENT'", async () => {
  mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId });
  mockTx.goalDeposit.create.mockResolvedValue(mockDeposit);
  mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({
    totalDeposited: new Prisma.Decimal(100),
  });

  await goalDepositService(goalId, userId, 1000);

  expect(adjustBalanceWithTx).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "DECREMENT",
      reason: "GOAL_DEPOSIT",
    }),
  );
});

it("should propagate error from adjustBalanceWithTx", async () => {
  vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
    initialAmount: new Prisma.Decimal(100)
  })
  vi.mocked(financialGoalsRepository.getLatestSnapshot).mockResolvedValue(null)
  vi.mocked(adjustBalanceWithTx).mockRejectedValue(new Error("Adjust balance helper error"))

  await expect(goalDepositService(goalId, userId, 1000)).rejects.toThrow(
    "Adjust balance helper error",
  );
})
