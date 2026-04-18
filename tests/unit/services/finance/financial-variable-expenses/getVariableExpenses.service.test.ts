import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { getVariableExpensesService } from "../../../../../src/modules/finance/variable-expenses/services/getVariableExpenses.service";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository",
);

const mockVariableExpenses = [
  {
    id: "expenseId",
    name: "expense",
    amount: new Prisma.Decimal(100.45),
    expenseDate: new Date(),
    updatedAt: new Date(),
    category: {
      id: "categoryId",
      name: "FOOD",
    },
  },
];

describe("get variable expenses service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return expenses", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    const result = await getVariableExpensesService("userId");

    expect(result).toEqual(mockVariableExpenses);

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      undefined,
      undefined,
      undefined,
      10,
      undefined,
    );
  });

  it("should pass filters correctly", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");

    await getVariableExpensesService(
      "userId",
      startDate,
      endDate,
      "categoryId",
      20,
      "cursorId",
    );

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      startDate,
      endDate,
      "categoryId",
      20,
      "cursorId",
    );
  });

  it("should use default limit when of 10", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    await getVariableExpensesService("userId");

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      undefined,
      undefined,
      undefined,
      10,
      undefined,
    );
  });

  it("should pass limit to repository", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    await getVariableExpensesService(
      "userId",
      undefined,
      undefined,
      undefined,
      11,
    );

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      undefined,
      undefined,
      undefined,
      11,
      undefined,
    );
  });

  it("should pass cursor to repository", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    await getVariableExpensesService(
      "userId",
      undefined,
      undefined,
      undefined,
      undefined,
      "cursor-123",
    );

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      undefined,
      undefined,
      undefined,
      10,
      "cursor-123",
    );
  });

  it("should pass limit and cursor to repository", async () => {
    vi.mocked(variableExpenseRepository.findManyById).mockResolvedValue(
      mockVariableExpenses,
    );

    await getVariableExpensesService(
      "userId",
      undefined,
      undefined,
      undefined,
      5,
      "cursor-123",
    );

    expect(variableExpenseRepository.findManyById).toHaveBeenCalledWith(
      "userId",
      undefined,
      undefined,
      undefined,
      5,
      "cursor-123",
    );
  });
  it("should propagate repository errors", async () => {
      const error = new Error("Database failed");
  
      vi.mocked(variableExpenseRepository.findManyById).mockRejectedValue(
        error,
      );
  
      await expect(getVariableExpensesService("user-123")).rejects.toThrow(
        "Database failed",
      );
    });
});
