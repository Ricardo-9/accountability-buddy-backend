import { describe, expect, it, vi, beforeEach } from "vitest";
import { variableExpenseRepository } from "../../../../../src/modules/finance/repositories/variableExpenses.repository";
import { variableExpenseService } from "../../../../../src/modules/finance/services/variableExpenses.service";
import { Prisma } from "@prisma/client";

vi.mock(
  "../../../../../src/modules/finance/repositories/variableExpenses.repository",
);

const mockVariableExpense = {
  id: "expense-123",
  userId: "user-123",
  categoryId: null,
  name: "Random Name",
  amount: new Prisma.Decimal(234.45),
  expenseDate: new Date("2025-04-01"),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

describe("variableExpenseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getVariableExpense (single)", () => {
    it("should return the expense when it exists and belongs to user", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );

      const result = await variableExpenseService.getVariableExpense(
        "user-123",
        "expense-123",
      );

      expect(result).toEqual(mockVariableExpense);
      expect(variableExpenseRepository.findOneById).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
      );
    });

    it("should throw NOT_FOUND when expense does not exist", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(null);

      await expect(
        variableExpenseService.getVariableExpense("user-123", "expense-123"),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "variable expense not found",
        statusCode: 404,
      });
    });
  });

  describe("getVariableExpenses (multi)", () => {
    it("should return all expenses for the user", async () => {
      vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
        [mockVariableExpense],
      );

      const result = await variableExpenseService.getVariableExpenses(
        "user-123",
        {},
      );

      expect(result).toEqual([mockVariableExpense]);
      expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
        "user-123",
        {},
      );
    });

    it("should return empty array when user has no expenses", async () => {
      vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue([]);

      const result = await variableExpenseService.getVariableExpenses(
        "user-123",
        {},
      );

      expect(result).toEqual([]);
    });
  });

  describe("createVariableExpense", () => {
    it("should create and return the new variable expense", async () => {
      vi.mocked(variableExpenseRepository.create).mockResolvedValue(
        mockVariableExpense,
      );

      const result = await variableExpenseService.createVariableExpense(
        "user-123",
        {
          categoryId: null,
          name: "Random Name",
          amount: 234.45,
          expenseDate: new Date("2025-04-01"),
        },
      );

      expect(result).toEqual(mockVariableExpense);
      expect(variableExpenseRepository.create).toHaveBeenCalledWith(
        "user-123",
        {
          categoryId: null,
          name: "Random Name",
          amount: 234.45,
          expenseDate: new Date("2025-04-01"),
        },
      );
    });

    it("should throw INVALID_REFERENCE when categoryId does not exist", async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        { code: "P2003", clientVersion: "5.0.0" },
      );

      vi.mocked(variableExpenseRepository.create).mockRejectedValue(
        prismaError,
      );

      await expect(
        variableExpenseService.createVariableExpense("user-123", {
          categoryId: "non-existent-uuid",
          name: "Random Name",
          amount: 234.45,
          expenseDate: new Date("2025-04-01"),
        }),
      ).rejects.toMatchObject({
        code: "INVALID_REFERENCE",
        message: "Category not found",
        statusCode: 404,
      });
    });

    it("should rethrow unknown errors", async () => {
      const unknownError = new Error("Database connection lost");

      vi.mocked(variableExpenseRepository.create).mockRejectedValue(
        unknownError,
      );

      await expect(
        variableExpenseService.createVariableExpense("user-123", {
          categoryId: null,
          name: "Random Name",
          amount: 234.45,
          expenseDate: new Date("2025-04-01"),
        }),
      ).rejects.toThrow("Database connection lost");
    });
  });

  describe("updateVariableExpense", () => {
    it("should update and return the expense when amount increases", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );
      vi.mocked(variableExpenseRepository.update).mockResolvedValue({
        ...mockVariableExpense,
        amount: new Prisma.Decimal(300),
      });

      const result = await variableExpenseService.updateVariableExpense(
        "user-123",
        "expense-123",
        { amount: 300 },
      );

      expect(result.amount).toEqual(new Prisma.Decimal(300));
      expect(variableExpenseRepository.update).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
        { amount: 300 },
        expect.closeTo(65.55, 2),
        "DECREMENT",
        "EXPENSE",
      );
    });

    it("should update and return the expense when amount decreases", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );
      vi.mocked(variableExpenseRepository.update).mockResolvedValue({
        ...mockVariableExpense,
        amount: new Prisma.Decimal(100),
      });

      const result = await variableExpenseService.updateVariableExpense(
        "user-123",
        "expense-123",
        { amount: 100 },
      );

      expect(result.amount).toEqual(new Prisma.Decimal(100));
      expect(variableExpenseRepository.update).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
        { amount: 100 },
        expect.closeTo(134.45, 2),
        "INCREMENT",
        "INCOME",
      );
    });

    it("should update without adjusting balance when amount is unchanged", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );
      vi.mocked(variableExpenseRepository.update).mockResolvedValue(
        mockVariableExpense,
      );

      await variableExpenseService.updateVariableExpense(
        "user-123",
        "expense-123",
        { amount: 234.45 },
      );

      expect(variableExpenseRepository.update).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
        { amount: 234.45 },
        undefined,
        "DECREMENT",
        "EXPENSE",
      );
    });

    it("should update without touching balance when amount is not sent", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );
      vi.mocked(variableExpenseRepository.update).mockResolvedValue({
        ...mockVariableExpense,
        name: "New Name",
      });

      const result = await variableExpenseService.updateVariableExpense(
        "user-123",
        "expense-123",
        { name: "New Name" },
      );

      expect(result.name).toBe("New Name");
      expect(variableExpenseRepository.update).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
        { name: "New Name" },
        undefined,
        "DECREMENT",
        "EXPENSE",
      );
    });

    it("should throw NOT_FOUND when expense does not exist", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(null);

      await expect(
        variableExpenseService.updateVariableExpense(
          "user-123",
          "expense-123",
          { name: "New Name" },
        ),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });

    it("should throw INVALID_REFERENCE when categoryId does not exist", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        { code: "P2003", clientVersion: "5.0.0" },
      );

      vi.mocked(variableExpenseRepository.update).mockRejectedValue(
        prismaError,
      );

      await expect(
        variableExpenseService.updateVariableExpense(
          "user-123",
          "expense-123",
          { categoryId: "non-existent-uuid" },
        ),
      ).rejects.toMatchObject({
        code: "INVALID_REFERENCE",
        message: "Category not found",
        statusCode: 404,
      });
    });
  });

  describe("deleteVariableExpense", () => {
    it("should delete the expense when it exists and belongs to user", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(
        mockVariableExpense,
      );
      vi.mocked(variableExpenseRepository.delete).mockResolvedValue(
        mockVariableExpense,
      );

      await variableExpenseService.deleteExpense("user-123", "expense-123");

      expect(variableExpenseRepository.delete).toHaveBeenCalledWith(
        "user-123",
        "expense-123",
        234.45,
      );
    });

    it("should throw NOT_FOUND when expense does not exist", async () => {
      vi.mocked(variableExpenseRepository.findOneById).mockResolvedValue(null);

      await expect(
        variableExpenseService.deleteExpense("user-123", "expense-123"),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        statusCode: 404,
      });
    });
  });
});