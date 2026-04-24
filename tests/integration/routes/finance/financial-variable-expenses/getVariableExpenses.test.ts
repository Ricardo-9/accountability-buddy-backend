import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";
import { getVariableExpensesService } from "../../../../../src/modules/finance/variable-expenses/services/getVariableExpenses.service.js";

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
  "../../../../../src/modules/finance/variable-expenses/services/getVariableExpenses.service.js",
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

describe("get variable expenses integration test", () => {
  it("should return variable expenses successfully", async () => {
    vi.mocked(getVariableExpensesService).mockResolvedValue([mockExpenseDb]);

    const response = await request(app).get("/finance/variable-expense");

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      variableExpenses: [mockExpenseResponse],
      nextCursor: null,
    });
  });

  it("should return paginated result with nextCursor", async () => {
    vi.mocked(getVariableExpensesService).mockResolvedValue([
      mockExpenseDb,
      {
        ...mockExpenseDb,
        id: "cursor-id",
      },
    ] as any);

    const response = await request(app)
      .get("/finance/variable-expense")
      .query({ limit: 1 });

    expect(response.status).toBe(200);

    expect(response.body.data.nextCursor).toBe(mockExpenseDb.id);
  });

  it("should filter by startDate and endDate", async () => {
    vi.mocked(getVariableExpensesService).mockResolvedValue([]);

    const response = await request(app).get(
      "/finance/variable-expense?startDate=2025-01-01&endDate=2025-02-01",
    );

    expect(response.status).toBe(200);

    expect(getVariableExpensesService).toHaveBeenCalledWith(
      "user-123",
      new Date("2025-01-01"),
      new Date("2025-02-01"),
      undefined,
      10,
      undefined,
    );
  });

  it("should filter by categoryId", async () => {
    vi.mocked(getVariableExpensesService).mockResolvedValue([]);

    const response = await request(app).get(
      "/finance/variable-expense?categoryId=3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(200);
  });

  it("should return 400 when startDate > endDate", async () => {
    const response = await request(app).get(
      "/finance/variable-expense?startDate=2025-02-01&endDate=2025-01-01",
    );

    expect(response.status).toBe(400);
  });

  it("should return 400 when invalid categoryId", async () => {
    const response = await request(app).get(
      "/finance/variable-expense?categoryId=123",
    );

    expect(response.status).toBe(400);
  });

  it("should return 400 when invalid cursor", async () => {
    const response = await request(app).get(
      "/finance/variable-expense?cursor=123",
    );

    expect(response.status).toBe(400);
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).get("/finance/variable-expense");

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).get("/finance/variable-expense");

    expect(response.status).toBe(403);
  });

  it("should return 404 when user does not have financial account", async () => {
    requireFinancialAccountShouldFail = true;

    const response = await request(app).get("/finance/variable-expense");

    expect(response.status).toBe(404);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(getVariableExpensesService).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).get("/finance/variable-expense");

    expect(response.status).toBe(500);
  });
});