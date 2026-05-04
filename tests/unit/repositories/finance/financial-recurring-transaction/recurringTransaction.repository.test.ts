import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma, RecurrenceUnit, TransactionType } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => {
  return {
    prisma: {
      recurringTransaction: {
        findMany: vi.fn(),
      },
    },
  };
});

import { prisma } from "../../../../../src/lib/prisma";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

const mockTx = {
  recurringTransaction: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
  },
  recurringTransactionExecution: {
    create: vi.fn(),
  },
} as unknown as Prisma.TransactionClient;

describe("Recurring transaction repository test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findManyByUserId", () => {
    it("should call prisma with default params", async () => {
      await recurringTransactionRepository.findManyByUserId("user-123");

      expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          deletedAt: null,
        },
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
          nextOccurrence: true,
          updatedAt: true,
        },
        orderBy: { nextOccurrence: "asc" },
        take: 11,
      });
    });

    it("should apply filters correctly", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-02-01");

      await recurringTransactionRepository.findManyByUserId(
        "user-123",
        5,
        "cursor-id",
        TransactionType.EXPENSE,
        "category-123",
        startDate,
        endDate,
      );

      expect(prisma.recurringTransaction.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          deletedAt: null,
          type: TransactionType.EXPENSE,
          categoryId: "category-123",
          nextOccurrence: {
            gte: startDate,
            lte: endDate,
          },
        },
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
          nextOccurrence: true,
          updatedAt: true,
        },
        orderBy: { nextOccurrence: "asc" },
        take: 6,
        skip: 1,
        cursor: { id: "cursor-id" },
      });
    });
  });

  describe("findById", () => {
    it("should call transaction with correct params", async () => {
      await recurringTransactionRepository.findById(
        mockTx,
        "user-123",
        "id",
      );

      expect(mockTx.recurringTransaction.findFirst).toHaveBeenCalledWith({
        where: {
          id: "id",
          userId: "user-123",
          deletedAt: null,
        },
      });
    });
  });

  describe("findPendingTransactions", () => {
    it("should call transaction with correct params", async () => {
      await recurringTransactionRepository.findPendingTransactions(
        mockTx,
      );

      expect(mockTx.recurringTransaction.findMany).toHaveBeenCalledWith({
        where: {
          nextOccurrence: { lte: expect.any(Date) },
          deletedAt: null,
        },
        select: {
          id: true,
          userId: true,
        },
      });
    });
  });

  describe("createTransactionExecution", () => {
    it("should call transaction with correct params", async () => {
      const data = {
        transactionId: "transactionId",
        amount: new Prisma.Decimal(1000),
        executedAt: new Date(),
        balanceBefore: new Prisma.Decimal(1500),
        balanceAfter: new Prisma.Decimal(500),
      };

      await recurringTransactionRepository.createTransactionExecution(
        mockTx,
        data,
      );

      expect(
        mockTx.recurringTransactionExecution.create,
      ).toHaveBeenCalledWith({ data });
    });
  });

  describe("updateNextOccurrence", () => {
    it("should call transaction with correct params", async () => {
      const data = {
        lastExecutedAt: new Date(),
        nextOccurrence: new Date(),
      };

      await recurringTransactionRepository.updateNextOccurrence(
        mockTx,
        "id",
        data,
      );

      expect(mockTx.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: "id" },
        data,
      });
    });
  });

  describe("createRecurringTransaction", () => {
    it("should call transaction with correct params", async () => {
      const data = {
        type: TransactionType.INCOME,
        name: "Transaction name",
        amount: 2000,
        recurrenceValue: 1,
        recurrenceUnit: RecurrenceUnit.MONTH,
        nextOccurrence: new Date(),
        categoryId: null,
        dayOfMonth: null,
      };

      await recurringTransactionRepository.createRecurringTransaction(
        mockTx,
        "userId",
        data,
      );

      expect(mockTx.recurringTransaction.create).toHaveBeenCalledWith({
        data: {
          userId: "userId",
          ...data,
          amount: new Prisma.Decimal(data.amount),
        },
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

  describe("deleteRecurringTransaction", () => {
    it("should call transaction with correct params", async () => {
      await recurringTransactionRepository.deleteRecurringTransaction(
        mockTx,
        "userId",
        "goalId",
      );

      expect(mockTx.recurringTransaction.updateMany).toHaveBeenCalledWith({
        where: { id: "goalId", userId: "userId", deletedAt: null },
        data: { deletedAt: expect.any(Date) },
      });
    });
  });

  describe("updateRecurringTransaction", () => {
    it("should update and return the transaction", async () => {
      const updateData = {
        name: "Updated",
        amount: 50,
        nextOccurrence: new Date(),
      };

      mockTx.recurringTransaction.updateMany = vi.fn().mockResolvedValue({
        count: 1,
      });

      mockTx.recurringTransaction.findFirst = vi.fn().mockResolvedValue({
        id: "id",
        name: "Updated",
      });

      const result =
        await recurringTransactionRepository.updateRecurringTransaction(
          mockTx,
          "id",
          "user-123",
          updateData as any,
        );

      expect(mockTx.recurringTransaction.updateMany).toHaveBeenCalledWith({
        where: { id: "id", userId: "user-123", deletedAt: null },
        data: expect.objectContaining({
          name: "Updated",
          amount: expect.any(Prisma.Decimal),
        }),
      });

      expect(result).toEqual({
        id: "id",
        name: "Updated",
      });
    });

    it("should return null when nothing is updated", async () => {
      mockTx.recurringTransaction.updateMany = vi.fn().mockResolvedValue({
        count: 0,
      });

      const result =
        await recurringTransactionRepository.updateRecurringTransaction(
          mockTx,
          "id",
          "user-123",
          {
            name: "Updated",
            nextOccurrence: new Date(),
          } as any,
        );

      expect(result).toBeNull();
    });
  });
});