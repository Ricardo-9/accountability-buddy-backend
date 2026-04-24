import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { updateVariableExpenseService } from "../../../../../src/modules/finance/variable-expenses/services/updateVariableExpense.service.js";

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
  "../../../../../src/modules/finance/variable-expenses/services/updateVariableExpense.service.js",
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

describe("update variable expense integration test", () => {
  it("should update variable expense successfully", async () => {
    vi.mocked(updateVariableExpenseService).mockResolvedValue(mockExpenseDb);

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({
        name: "Updated",
        amount: 300,
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      variableExpense: mockExpenseResponse,
    });
  });

  it("should update only name", async () => {
    vi.mocked(updateVariableExpenseService).mockResolvedValue(mockExpenseDb);

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({
        name: "Updated",
      });

    expect(response.status).toBe(200);
  });

  it("should update removing category", async () => {
    vi.mocked(updateVariableExpenseService).mockResolvedValue(mockExpenseDb);

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({
        categoryId: null,
      });

    expect(response.status).toBe(200);
  });

  it("should return 400 when id is not uuid", async () => {
    const response = await request(app)
      .patch("/finance/variable-expense/123")
      .send({
        name: "Updated",
      });

    expect(response.status).toBe(400);
  });

  it("should return 400 when invalid categoryId", async () => {
    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({
        categoryId: "123",
      });

    expect(response.status).toBe(400);
  });

  it("should return 401 when user not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "Updated" });

    expect(response.status).toBe(401);
  });

  it("should return 403 when user has no area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "Updated" });

    expect(response.status).toBe(403);
  });

  it("should return 404 when user has no account", async () => {
    requireFinancialAccountShouldFail = true;

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "Updated" });

    expect(response.status).toBe(404);
  });

  it("should return 404 when expense not found", async () => {
    vi.mocked(updateVariableExpenseService).mockRejectedValue(
      new AppError("NOT_FOUND", "variable expense not found", 404),
    );

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "Updated" });

    expect(response.status).toBe(404);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(updateVariableExpenseService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app)
      .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "Updated" });

    expect(response.status).toBe(500);
  });
});