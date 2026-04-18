import { describe, expect, it, vi, beforeEach } from "vitest";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";
import { Prisma } from "@prisma/client";
import { deleteVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/deleteVariableExpense.service";
import { fetchExpense } from "../../../../../src/modules/finance/variable-expenses/helpers/fetchVariableExpense.helper";
import { AppError } from "../../../../../src/core/errors/AppError";

const mockVariableExpense = {
  id: "expenseId",
  name: "expense",
  amount: Prisma.Decimal(100.45),
  expenseDate: new Date("026-04-18T12:56:06.724Z,"),
  updatedAt: new Date("026-04-18T12:56:06.724Z,"),
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

describe("deletevariable expense service test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete the variable expense", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockVariableExpense);
    vi.mocked(variableExpenseRepository.delete).mockResolvedValue({
      id: "expenseId",
      name: "expense",
      amount: Prisma.Decimal(100.45),
      expenseDate: new Date("026-04-18T12:56:06.724Z,"),
      deletedAt: new Date("026-04-18T12:56:06.724Z,"),
      category: {
        id: "categoryId",
        name: "FOOD",
      },
    });

    const result = await deleteVariableExpenseService("userId", "expenseId");

    expect(fetchExpense).toHaveBeenCalledWith("userId", "expenseId");

    expect(result).toEqual({
      id: "expenseId",
      name: "expense",
      amount: Prisma.Decimal(100.45),
      expenseDate: new Date("026-04-18T12:56:06.724Z,"),
      deletedAt: new Date("026-04-18T12:56:06.724Z,"),
      category: {
        id: "categoryId",
        name: "FOOD",
      },
    });
  });
  it("should throw NOT_FOUND when the variable expense does not exist", async () => {
    const notFoundError = new AppError(
      "NOT_FOUND",
      "variable expense not found",
      404,
    );

    vi.mocked(fetchExpense).mockRejectedValue(notFoundError);

    await expect(
      deleteVariableExpenseService("userId", "expenseId"),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "variable expense not found",
    });
  });
});
