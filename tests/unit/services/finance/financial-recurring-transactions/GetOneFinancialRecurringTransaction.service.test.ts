import { describe, expect, it, beforeEach, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { getOneRecurringTransactionService } from "../../../../../src/modules/finance/services/getonerecurringtransaction.service";
import { Prisma } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      findUnique: vi.fn(),
    },
  },
}));

const mockRecurringTransaction = {
  id: "rec-123",
  userId: "user-456",
  categoryId: "cat-789",
  type: "EXPENSE" as const,
  name: "Netflix Subscription",
  amount: new Prisma.Decimal(49.9),
  recurrenceValue: 1,
  recurrenceUnit: "MONTH" as const,
  dayOfMonth: 15,
  createdAt: new Date("2026-01-15"),
  nextOccurrence: new Date("2026-05-15"),
  lastExecutedAt: null,
  updatedAt: new Date("2026-01-15"),
  deletedAt: null,
};

describe("Get one recurring transaction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return the recurring transaction when it exists and belongs to user", async () => {
    vi.mocked(prisma.recurringTransaction.findUnique).mockResolvedValue(
      mockRecurringTransaction,
    );

    const result = await getOneRecurringTransactionService(
      "user-456",
      "rec-123",
    );

    expect(result).toEqual(mockRecurringTransaction);
    expect(prisma.recurringTransaction.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-456", id: "rec-123", deletedAt: null },
      select: {
        id: true,
        userId: true,
        categoryId: true,
        type: true,
        name: true,
        amount: true,
        recurrenceValue: true,
        recurrenceUnit: true,
        dayOfMonth: true,
        createdAt: true,
        nextOccurrence: true,
      },
    });
  });

  it("should return null when it does not exists", async () => {
    vi.mocked(prisma.recurringTransaction.findUnique).mockResolvedValue(null);

    const result = await getOneRecurringTransactionService(
      "user-456",
      "non-existent-id",
    );

    expect(result).toEqual(null);
    expect(prisma.recurringTransaction.findUnique).toHaveBeenCalledWith({
      where: { userId: "user-456", id: "non-existent-id", deletedAt: null },
      select: {
        id: true,
        userId: true,
        categoryId: true,
        type: true,
        name: true,
        amount: true,
        recurrenceValue: true,
        recurrenceUnit: true,
        dayOfMonth: true,
        createdAt: true,
        nextOccurrence: true,
      },
    });
  });
});
