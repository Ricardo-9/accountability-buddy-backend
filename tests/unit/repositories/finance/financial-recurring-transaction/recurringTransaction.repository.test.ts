import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

const mockTx = {
  recurringTransaction: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  recurringTransactionExecution: {
    create: vi.fn(),
  },
} as unknown as Prisma.TransactionClient;

describe("Recurring transaction repository test", () => {
  beforeEach(() => vi.clearAllMocks());

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
        mockTx as any,
      );

      expect(mockTx.recurringTransaction.findMany).toHaveBeenCalledWith({
        where: {
          nextOccurrence: { lte: expect.any(Date) },
          deletedAt: null,
        },
        select: { id: true },
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

      expect(mockTx.recurringTransaction.findFirst).toHaveBeenCalled();

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