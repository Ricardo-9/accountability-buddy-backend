import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { fetchExpense } from "../../../../../src/modules/finance/variable-expenses/helpers/fetchVariableExpense.helper";
import { getOneVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/getOneVariableExpense.service";
import { AppError } from "../../../../../src/core/errors/AppError";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";
const mockVariableExpense = {
  id: "expenseId",
  name: "expense",
  amount: Prisma.Decimal(100.45),
  expenseDate: new Date(),
  updatedAt: new Date(),
  category: {
    id: "categoryId",
    name: "FOOD",
  },
};

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository",
);

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/helpers/fetchVariableExpense.helper",
);

describe("get one variable expense service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the variable expense for the user", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockVariableExpense);

    const result = await getOneVariableExpenseService("userID", "expenseId");

    expect(result).toEqual(mockVariableExpense);
  });
  it("should throw NOT_FOUND when the variable expense does not exist", async () => {
    const notFoundError = new AppError(
      "NOT_FOUND",
      "variable expense not found",
      404,
    );

    vi.mocked(fetchExpense).mockRejectedValue(notFoundError);

    await expect(
      getOneVariableExpenseService("userId", "expenseId"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "variable expense not found",
    });
  });
  it("should propagate repository errors", async () => {
    const error = new Error("Database failed");

    vi.mocked(fetchExpense).mockRejectedValue(error);

    await expect(
      getOneVariableExpenseService("user-123", "expenseId"),
    ).rejects.toThrow("Database failed");
  });
});
