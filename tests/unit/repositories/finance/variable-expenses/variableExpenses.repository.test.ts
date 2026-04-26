import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";
import { prisma } from "../../../../../src/lib/prisma";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    variableExpense: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
);

describe("variableExpenseRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findOneById", () => {
    it("should call prisma.findUnique with correct params", async () => {
      const mockResponse = { id: "expense-id" };

      vi.mocked(prisma.variableExpense.findUnique).mockResolvedValue(
        mockResponse as any,
      );

      const result = await variableExpenseRepository.findOneById(
        "user-id",
        "expense-id",
      );

      expect(prisma.variableExpense.findUnique).toHaveBeenCalledWith({
        where: {
          id: "expense-id",
          userId: "user-id",
          deletedAt: null,
        },
        select: expect.any(Object),
      });

      expect(result).toEqual(mockResponse);
    });
  });

  describe("findManyById", () => {
    it("should call prisma.findMany without filters", async () => {
      vi.mocked(prisma.variableExpense.findMany).mockResolvedValue([]);

      await variableExpenseRepository.findManyById("user-id");

      expect(prisma.variableExpense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-id",
            deletedAt: null,
          },
          take: 11,
        }),
      );
    });

    it("should apply date filters", async () => {
      const startDate = new Date("2025-01-01");
      const endDate = new Date("2025-02-01");

      vi.mocked(prisma.variableExpense.findMany).mockResolvedValue([]);

      await variableExpenseRepository.findManyById(
        "user-id",
        startDate,
        endDate,
      );

      expect(prisma.variableExpense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            expenseDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
        }),
      );
    });

    it("should apply category filter", async () => {
      vi.mocked(prisma.variableExpense.findMany).mockResolvedValue([]);

      await variableExpenseRepository.findManyById(
        "user-id",
        undefined,
        undefined,
        "category-id",
      );

      expect(prisma.variableExpense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: "category-id",
          }),
        }),
      );
    });

    it("should apply cursor pagination", async () => {
      vi.mocked(prisma.variableExpense.findMany).mockResolvedValue([]);

      await variableExpenseRepository.findManyById(
        "user-id",
        undefined,
        undefined,
        undefined,
        10,
        "cursor-id",
      );

      expect(prisma.variableExpense.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: { id: "cursor-id" },
          skip: 1,
        }),
      );
    });
  });

  describe("create", () => {
    it("should create expense and adjust balance", async () => {
      const mockExpense = { id: "expense-id" };

      const tx = {
        variableExpense: {
          create: vi.fn().mockResolvedValue(mockExpense),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) =>
        callback(tx),
      );

      const data = {
        name: "expense",
        amount: 100,
        expenseDate: new Date(),
      };

      const result = await variableExpenseRepository.create("user-id", data);

      expect(tx.variableExpense.create).toHaveBeenCalled();

      expect(adjustBalanceWithTx).toHaveBeenCalledWith({
        tx,
        userId: "user-id",
        amount: 100,
        type: "DECREMENT",
        reason: "EXPENSE",
      });

      expect(result).toEqual(mockExpense);
    });
  });

  describe("update", () => {
    it("should update expense without adjusting balance", async () => {
      const mockUpdated = { id: "expense-id" };

      const tx = {
        variableExpense: {
          update: vi.fn().mockResolvedValue(mockUpdated),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
        cb(tx),
      );

      const result = await variableExpenseRepository.update(
        "user-id",
        "expense-id",
        { name: "updated" },
        undefined,
        "DECREMENT",
        "EXPENSE",
      );

      expect(adjustBalanceWithTx).not.toHaveBeenCalled();

      expect(result).toEqual(mockUpdated);
    });

    it("should adjust balance when amountToAdjust provided", async () => {
      const mockUpdated = { id: "expense-id" };

      const tx = {
        variableExpense: {
          update: vi.fn().mockResolvedValue(mockUpdated),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
        cb(tx),
      );

      await variableExpenseRepository.update(
        "user-id",
        "expense-id",
        { amount: 200 },
        50,
        "DECREMENT",
        "EXPENSE",
      );

      expect(adjustBalanceWithTx).toHaveBeenCalledWith({
        tx,
        userId: "user-id",
        amount: 50,
        type: "DECREMENT",
        reason: "EXPENSE",
      });
    });
  });

  describe("delete", () => {
    it("should soft delete and restore balance", async () => {
      const mockDeleted = { id: "expense-id" };

      const tx = {
        variableExpense: {
          update: vi.fn().mockResolvedValue(mockDeleted),
        },
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) =>
        cb(tx),
      );

      const result = await variableExpenseRepository.delete(
        "user-id",
        "expense-id",
        100,
      );

      expect(tx.variableExpense.update).toHaveBeenCalled();

      expect(adjustBalanceWithTx).toHaveBeenCalledWith({
        tx,
        userId: "user-id",
        amount: 100,
        type: "INCREMENT",
        reason: "INCOME",
      });

      expect(result).toEqual(mockDeleted);
    });
  });
});