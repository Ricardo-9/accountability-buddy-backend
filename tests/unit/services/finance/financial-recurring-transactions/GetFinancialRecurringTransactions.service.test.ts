import { describe, expect, it, beforeEach, vi } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { getRecurringTransactionService } from "../../../../../src/modules/finance/services/getrecurringtransaction.service";
import { Prisma } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      findMany: vi.fn(),
    },
  },
}));

const mockRecurringTransactions = [
  {
    id: "rec-1",
    userId: "user-1",
    categoryId: "cat-1",
    type: "EXPENSE" as const,
    name: "Netflix",
    amount: new Prisma.Decimal(49.9),
    recurrenceValue: 1,
    recurrenceUnit: "MONTH" as const,
    dayOfMonth: 15,
    nextOccurrence: new Date("2026-05-15"),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lastExecutedAt: null,
  },
];

describe("Get recurring transactions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return recurring transactions with default pagination", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    const result = await getRecurringTransactionService("user-1", {
      page: 1,
      limit: 10,
      order: "asc",
    });

    expect(result).toEqual(mockRecurringTransactions);

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        deletedAt: null,
      },
      skip: 0,
      take: 10,
      orderBy: { nextOccurrence: "asc" },
    });
  });

  it("should filter by type", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    await getRecurringTransactionService("user-1", {
      type: "EXPENSE",
      page: 1,
      limit: 10,
      order: "asc",
    });

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        deletedAt: null,
        type: "EXPENSE",
      },
      skip: 0,
      take: 10,
      orderBy: { nextOccurrence: "asc" },
    });
  });

  it("should filter by categoryId", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    await getRecurringTransactionService("user-1", {
      categoryId: "cat-1",
      page: 1,
      limit: 10,
      order: "asc",
    });

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        categoryId: "cat-1",
        deletedAt: null,
      },
      skip: 0,
      take: 10,
      orderBy: { nextOccurrence: "asc" },
    });
  });

  it("should filter by date range", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    const startDate = new Date("2026-01-01");
    const endDate = new Date("2026-12-31");

    await getRecurringTransactionService("user-1", {
      startDate,
      endDate,
      page: 1,
      limit: 10,
      order: "asc",
    });

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        nextOccurrence: {
          gte: startDate,
          lte: endDate,
        },
        deletedAt: null,
      },
      skip: 0,
      take: 10,
      orderBy: { nextOccurrence: "asc" },
    });
  });

  it("should apply pagination correctly", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    await getRecurringTransactionService("user-1", {
      page: 2,
      limit: 10,
      order: "asc",
    });

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        deletedAt: null,
      },
      skip: 10,
      take: 10,
      orderBy: { nextOccurrence: "asc" },
    });
  });

  it("should apply descending order", async () => {
    vi.mocked(prisma.recurringTransaction.findMany).mockResolvedValue(
      mockRecurringTransactions,
    );

    await getRecurringTransactionService("user-1", {
      page: 1,
      limit: 10,
      order: "desc",
    });

    expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        deletedAt: null,
      },
      skip: 0,
      take: 10,
      orderBy: { nextOccurrence: "desc" },
    });
  });
});
