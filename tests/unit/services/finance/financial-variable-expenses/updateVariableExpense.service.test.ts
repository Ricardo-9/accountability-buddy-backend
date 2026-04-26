import { describe, expect, it, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";
import { updateVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/updateVariableExpense.service";
import { variableExpenseRepository } from "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository";
import { fetchExpense } from "../../../../../src/modules/finance/variable-expenses/helpers/fetchVariableExpense.helper";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/repositories/variableExpenses.repository",
);

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/helpers/fetchVariableExpense.helper",
);

const mockExpense = {
  id: "expenseId",
  name: "expense",
  amount: new Prisma.Decimal(100),
  expenseDate: new Date("026-04-18T12:56:06.724Z,"),
  updatedAt: new Date("026-04-18T12:56:06.724Z,"),
  category: null,
};

const mockUpdated = {
  id: "expenseId",
  name: "updated",
  amount: new Prisma.Decimal(150),
  expenseDate: new Date(),
  updatedAt: new Date(),
  category: null,
};

describe("update variable expense service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update without adjusting balance when amount not provided", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockExpense);
    vi.mocked(variableExpenseRepository.update).mockResolvedValue(mockUpdated);

    const result = await updateVariableExpenseService("userId", "expenseId", {
      name: "updated",
    });

    expect(variableExpenseRepository.update).toHaveBeenCalledWith(
      "userId",
      "expenseId",
      { name: "updated" },
      undefined,
      "DECREMENT",
      "EXPENSE",
    );

    expect(result).toEqual(mockUpdated);
  });

  it("should DECREMENT when new amount is greater", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockExpense);
    vi.mocked(variableExpenseRepository.update).mockResolvedValue(mockUpdated);

    await updateVariableExpenseService("userId", "expenseId", {
      amount: 150,
    });

    expect(variableExpenseRepository.update).toHaveBeenCalledWith(
      "userId",
      "expenseId",
      { amount: 150 },
      50,
      "DECREMENT",
      "EXPENSE",
    );
  });

  it("should INCREMENT when new amount is smaller", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockExpense);
    vi.mocked(variableExpenseRepository.update).mockResolvedValue(mockUpdated);

    await updateVariableExpenseService("userId", "expenseId", {
      amount: 80,
    });

    expect(variableExpenseRepository.update).toHaveBeenCalledWith(
      "userId",
      "expenseId",
      { amount: 80 },
      20,
      "INCREMENT",
      "INCOME",
    );
  });

  it("should not adjust when amount is the same", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockExpense);
    vi.mocked(variableExpenseRepository.update).mockResolvedValue(mockUpdated);

    await updateVariableExpenseService("userId", "expenseId", {
      amount: 100,
    });

    expect(variableExpenseRepository.update).toHaveBeenCalledWith(
      "userId",
      "expenseId",
      { amount: 100 },
      undefined,
      "DECREMENT",
      "EXPENSE",
    );
  });

  it("should throw INVALID_REFERENCE when category is not found", async () => {
    vi.mocked(fetchExpense).mockResolvedValue(mockExpense);

    const prismaError = new Prisma.PrismaClientKnownRequestError(
      "Foreign key",
      { code: "P2003", clientVersion: "test" },
    );

    vi.mocked(variableExpenseRepository.update).mockRejectedValue(prismaError);

    await expect(
      updateVariableExpenseService("userId", "expenseId", {
        categoryId: "invalid",
      }),
    ).rejects.toMatchObject({
      code: "INVALID_REFERENCE",
      message: "Category not found",
      statusCode: 404,
    });
  });

  it("should throw NOT_FOUND when the variable expense does not exist", async () => {
    vi.mocked(fetchExpense).mockRejectedValue(
      new AppError("NOT_FOUND", "variable expense not found", 404),
    );

    await expect(
      updateVariableExpenseService("userId", "expenseId", {
        name: "test",
      }),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "variable expense not found",
    });
  });
});
