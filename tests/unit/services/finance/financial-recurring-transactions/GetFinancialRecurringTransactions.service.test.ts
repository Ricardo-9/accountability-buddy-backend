import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma, TransactionType, RecurrenceUnit } from "@prisma/client";
import { getRecurringTransactionService } from "../../../../../src/modules/finance/recurring-transactions/services/getRecurringTransaction.service";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

vi.mock(
  "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository",
);

const mockRecurringTransactions = [
  {
    id: "recurring-id",
    userId: "user-123",
    categoryId: "category-123",
    type: TransactionType.EXPENSE,
    name: "Netflix",
    amount: new Prisma.Decimal(39.9),
    recurrenceValue: 1,
    recurrenceUnit: RecurrenceUnit.MONTH,
    dayOfMonth: 10,
    nextOccurrence: new Date(),
    updatedAt: new Date(),
  },
];

describe("get recurring transactions service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return recurring transactions", async () => {
    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockResolvedValue(mockRecurringTransactions);

    const result = await getRecurringTransactionService("user-123");

    expect(result).toEqual(mockRecurringTransactions);

    expect(
      recurringTransactionRepository.findManyByUserId,
    ).toHaveBeenCalledWith(
      "user-123",
      10,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("should pass filters correctly", async () => {
    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockResolvedValue(mockRecurringTransactions);

    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-02-01");

    await getRecurringTransactionService(
      "user-123",
      20,
      "cursor-id",
      TransactionType.INCOME,
      "category-123",
      startDate,
      endDate,
    );

    expect(
      recurringTransactionRepository.findManyByUserId,
    ).toHaveBeenCalledWith(
      "user-123",
      20,
      "cursor-id",
      TransactionType.INCOME,
      "category-123",
      startDate,
      endDate,
    );
  });

  it("should use default limit (10)", async () => {
    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockResolvedValue(mockRecurringTransactions);

    await getRecurringTransactionService("user-123");

    expect(
      recurringTransactionRepository.findManyByUserId,
    ).toHaveBeenCalledWith(
      "user-123",
      10,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("should pass custom limit", async () => {
    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockResolvedValue(mockRecurringTransactions);

    await getRecurringTransactionService("user-123", 5);

    expect(
      recurringTransactionRepository.findManyByUserId,
    ).toHaveBeenCalledWith(
      "user-123",
      5,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("should pass cursor", async () => {
    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockResolvedValue(mockRecurringTransactions);

    await getRecurringTransactionService(
      "user-123",
      10,
      "cursor-123",
    );

    expect(
      recurringTransactionRepository.findManyByUserId,
    ).toHaveBeenCalledWith(
      "user-123",
      10,
      "cursor-123",
      undefined,
      undefined,
      undefined,
      undefined,
    );
  });

  it("should propagate repository errors", async () => {
    const error = new Error("Database failed");

    vi.mocked(
      recurringTransactionRepository.findManyByUserId,
    ).mockRejectedValue(error);

    await expect(
      getRecurringTransactionService("user-123"),
    ).rejects.toThrow("Database failed");
  });
});