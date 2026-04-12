import { describe, expect, beforeEach, vi, it } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { updateRecurringTransactionService } from "../../../../../src/modules/finance/services/updaterecurringtransaction.service";
import { Prisma } from "@prisma/client";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    recurringTransaction: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    financialCategory: {
      findFirst: vi.fn(),
    },
  },
}));

const mockRecurringTransaction = {
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
  lastExecutedAt: null,
};

describe("update recurring transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  (it("should update correctly the provided fields", async () => {
    vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
      mockRecurringTransaction,
    );

    vi.mocked(prisma.recurringTransaction.update).mockResolvedValue({
      ...mockRecurringTransaction,
      name: "New Name",
    });

    const result = await updateRecurringTransactionService("rec-1", "user-1", {
      name: "New Name",
    });

    expect(result).toEqual({
      ...mockRecurringTransaction,
      name: "New Name",
    });
    expect(prisma.recurringTransaction.update).toHaveBeenCalledWith({
      where: { id: "rec-1" },
      data: {
        categoryId: "cat-1",
        type: "EXPENSE" as const,
        name: "New Name",
        amount: new Prisma.Decimal(49.9),
        recurrenceValue: 1,
        recurrenceUnit: "MONTH" as const,
        dayOfMonth: 15,
        nextOccurrence: new Date("2026-05-15"),
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
    });
  }),
    it("should throw NOT_FOUND if recurring transaction not found", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(null);

      await expect(
        updateRecurringTransactionService("rec-2", "user-1", {
          name: "New Name",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Recurring transaction not found",
        statusCode: 404,
      });
    }),
    it("should Trhow NOT_FOUND if category does not exist", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
        mockRecurringTransaction,
      );
      vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null);

      await expect(
        updateRecurringTransactionService("rec-1", "user-1", {
          name: "New Name",
          categoryId: "invalid-id",
        }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Category not found",
        statusCode: 404,
      });
    }),
    it("should update nextOccurrence when firstOccurrence is provided", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
        mockRecurringTransaction,
      );
      vi.mocked(prisma.recurringTransaction.update).mockResolvedValue({
        ...mockRecurringTransaction,
        dayOfMonth: 19,
        nextOccurrence: new Date("2026-08-19"),
      });

      const result = await updateRecurringTransactionService(
        "rec-1",
        "user-1",
        { firstOccurrence: new Date("2026-08-19"), dayOfMonth: 19 },
      );

      expect(result.nextOccurrence).toEqual(new Date("2026-08-19"));
      expect(prisma.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        data: {
          categoryId: "cat-1",
          type: "EXPENSE" as const,
          name: "Netflix",
          amount: new Prisma.Decimal(49.9),
          recurrenceValue: 1,
          recurrenceUnit: "MONTH" as const,
          dayOfMonth: 19,
          nextOccurrence: new Date("2026-08-19"),
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
      });
    }),
    it("should adjust nextOccurrrence when monthly recurrence", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue({
        ...mockRecurringTransaction,
        dayOfMonth: 19,
        recurrenceUnit: "WEEK",
      });

      vi.mocked(prisma.recurringTransaction.update).mockResolvedValue({
        ...mockRecurringTransaction,
        dayOfMonth: 19,
        recurrenceUnit: "MONTH",
      });

      const result = await updateRecurringTransactionService(
        "rec-1",
        "user-1",
        { recurrenceUnit: "MONTH", dayOfMonth: 19 },
      );

      expect(result).toEqual({
        ...mockRecurringTransaction,
        dayOfMonth: 19,
        recurrenceUnit: "MONTH",
      });
      expect(prisma.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        data: {
          categoryId: "cat-1",
          type: "EXPENSE" as const,
          name: "Netflix",
          amount: new Prisma.Decimal(49.9),
          recurrenceValue: 1,
          recurrenceUnit: "MONTH" as const,
          dayOfMonth: 19,
          nextOccurrence: new Date("2026-05-19"),
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
      });
    }),
    it("should throw when dayOfMonth used with WEEK", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue({
        ...mockRecurringTransaction,
        dayOfMonth: null,
        recurrenceUnit: "WEEK",
      });

      await expect(
        updateRecurringTransactionService("rec-1", "user-1", {
          dayOfMonth: 19,
        }),
      ).rejects.toMatchObject({
        code: "INVALID_DATA",
        message: "dayOfMonth only allowed for monthly recurrence",
        statusCode: 400,
      });
    }),
    it("should throw if nextOccurrence is in the past", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
        mockRecurringTransaction,
      );

      await expect(
        updateRecurringTransactionService("rec-1", "user-1", {
          firstOccurrence: new Date("2008-01-01"),
        }),
      ).rejects.toMatchObject({
        code: "INVALID_DATA",
        message: "Next occurrence cannot be in the past",
        statusCode: 400,
      });
    }),
    it("should keep existing values when fields not provided", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
        mockRecurringTransaction,
      );
      vi.mocked(prisma.recurringTransaction.update).mockResolvedValue(
        mockRecurringTransaction,
      );

      const result = await updateRecurringTransactionService(
        "rec-1",
        "user-1",
        {},
      );

      expect(result).toEqual(mockRecurringTransaction);
      expect(prisma.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        data: {
          categoryId: "cat-1",
          type: "EXPENSE" as const,
          name: "Netflix",
          amount: new Prisma.Decimal(49.9),
          recurrenceValue: 1,
          recurrenceUnit: "MONTH" as const,
          dayOfMonth: 15,
          nextOccurrence: new Date("2026-05-15"),
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
      });
    }),
    it("should allow categoryId null", async () => {
      vi.mocked(prisma.recurringTransaction.findFirst).mockResolvedValue(
        mockRecurringTransaction,
      );
      vi.mocked(prisma.recurringTransaction.update).mockResolvedValue({
        ...mockRecurringTransaction,
        categoryId: null,
      });

      const result = await updateRecurringTransactionService(
        "rec-1",
        "user-1",
        { categoryId: null },
      );

      expect(result).toEqual({
        ...mockRecurringTransaction,
        categoryId: null,
      });

      expect(prisma.recurringTransaction.update).toHaveBeenCalledWith({
        where: { id: "rec-1" },
        data: {
          categoryId: null,
          type: "EXPENSE" as const,
          name: "Netflix",
          amount: new Prisma.Decimal(49.9),
          recurrenceValue: 1,
          recurrenceUnit: "MONTH" as const,
          dayOfMonth: 15,
          nextOccurrence: new Date("2026-05-15"),
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
      });
    }));
});
