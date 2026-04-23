import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { createVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/createVariableExpense.service.js";

const mockExpenseDb = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  category: null,
  name: "Random Expense",
  amount: new Prisma.Decimal(234.45),
  expenseDate: new Date("2025-04-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const mockExpenseResponse = {
  ...mockExpenseDb,
  amount: "234.45",
  expenseDate: mockExpenseDb.expenseDate.toISOString(),
  updatedAt: mockExpenseDb.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/variable-expenses/services/createVariableExpense.service.js",
);

vi.mock("../../../../../src/middlewares/authMiddleware.js", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../../../../../src/middlewares/requireArea.js", () => ({
  requireArea: vi.fn(() => (_req: any, _res: any, next: any) => {
    if (requireAreaShouldFail) {
      return next(
        new AppError(
          "FORBIDDEN",
          "User need to be registered in FINANCES to access this feature",
          403,
        ),
      );
    }
    next();
  }),
}));

vi.mock(
  "../../../../../src/modules/finance/middlewares/requireFinancialAccount.js",
  () => ({
    requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
      if (requireFinancialAccountShouldFail) {
        return next(new AppError("NOT_FOUND", "User account not found", 404));
      }
      next();
    }),
  }),
);

beforeEach(() => {
  vi.clearAllMocks();

  requireAreaShouldFail = false;
  requireFinancialAccountShouldFail = false;
});

describe("create variable expense integration test", () => {
  it("should create and return the variabe expense for the user", async () => {
    vi.mocked(createVariableExpenseService).mockResolvedValue(mockExpenseDb);

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });
    expect(response.body.data.variableExpense).toEqual(mockExpenseResponse);
    expect(response.status).toBe(200);
  });
  it("should create expense without category", async () => {
    vi.mocked(createVariableExpenseService).mockResolvedValue(mockExpenseDb);

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(200);
  });
  it("should return 400 when name does not exist", async () => {
    const response = await request(app).post("/finance/variable-expense").send({
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(400);
  });
  it("should return 400 when name is too short", async () => {
    const response = await request(app)
      .post("/finance/variable-expense")
      .send({ name: "A", amount: 234.45, expenseDate: "2025-04-01" });

    expect(response.status).toBe(400);
  });
  it("should return 400 when name is too long", async () => {
    const response = await request(app).post("/finance/variable-expense").send({
      name: "DDLpTqRvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdE",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(400);
  });
  it("should return 400 when categoryId is invalid", async () => {
    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
      categoryId: "invalid-id",
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 when amount is invalid", async () => {
    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: "invalid",
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(400);
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(403);
  });

  it("should return 404 when category does not exist", async () => {
    vi.mocked(createVariableExpenseService).mockRejectedValue(
      new AppError("INVALID_REFERENCE", "Category not found", 404),
    );

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
      categoryId: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
    });

    expect(response.status).toBe(404);
  });

  it("should throw error 404 (NOT_FOUND) if user does not have an account", async () => {
    requireFinancialAccountShouldFail = true;
    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("User account not found");
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(createVariableExpenseService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).post("/finance/variable-expense").send({
      name: "Random Expense",
      amount: 234.45,
      expenseDate: "2025-04-01",
    });

    expect(response.status).toBe(500);
  });
});
