import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { variableExpenseService } from "../../../../../src/modules/finance/services/variableExpenses.service.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { Prisma } from "@prisma/client";

const mockExpenseDb = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  userId: "user-123",
  categoryId: null,
  name: "Random Expense",
  amount: new Prisma.Decimal(234.45),
  expenseDate: new Date("2025-04-01T00:00:00.000Z"),
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  deletedAt: null,
};

const mockExpenseResponse = {
  ...mockExpenseDb,
  amount: "234.45",
  expenseDate: mockExpenseDb.expenseDate.toISOString(),
  createdAt: mockExpenseDb.createdAt.toISOString(),
  updatedAt: mockExpenseDb.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/services/variableExpenses.service",
  () => ({
    variableExpenseService: {
      getVariableExpense: vi.fn(),
      getVariableExpenses: vi.fn(),
      createVariableExpense: vi.fn(),
      updateVariableExpense: vi.fn(),
      deleteExpense: vi.fn(),
    },
  }),
);

vi.mock("../../../../../src/middlewares/authMiddleware.ts", () => ({
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

beforeEach(() => {
  vi.clearAllMocks();
  requireAreaShouldFail = false;
});

describe("variable expenses", () => {
  describe("get variable expense (single)", () => {
    it("should return 200 and the expense", async () => {
      vi.mocked(variableExpenseService.getVariableExpense).mockResolvedValue(
        mockExpenseDb,
      );

      const response = await request(app).get(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockExpenseResponse);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 400 when id is not a uuid", async () => {
      const response = await request(app).get(
        "/finance/variable-expense/invalid-id",
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when expense does not exist", async () => {
      vi.mocked(variableExpenseService.getVariableExpense).mockRejectedValue(
        new AppError("NOT_FOUND", "variable expense not found", 404),
      );

      const response = await request(app).get(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      });

      const response = await request(app).get(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have area permission", async () => {
      requireAreaShouldFail = true;

      const response = await request(app).get(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(403);
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(variableExpenseService.getVariableExpense).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).get(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(500);
    });
  });

  describe("get variable expenses (multi)", () => {
    it("should return 200 and list of expenses", async () => {
      vi.mocked(variableExpenseService.getVariableExpenses).mockResolvedValue([
        mockExpenseDb,
      ]);

      const response = await request(app).get("/finance/variable-expense");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockExpenseResponse]);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 200 and empty array when user has no expenses", async () => {
      vi.mocked(variableExpenseService.getVariableExpenses).mockResolvedValue(
        [],
      );

      const response = await request(app).get("/finance/variable-expense");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });

    it("should return 200 when filtering by date range", async () => {
      vi.mocked(variableExpenseService.getVariableExpenses).mockResolvedValue([
        mockExpenseDb,
      ]);

      const response = await request(app).get(
        "/finance/variable-expense?startDate=2025-01-01&endDate=2025-12-31",
      );

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockExpenseResponse]);
    });

    it("should return 200 when filtering by categoryId", async () => {
      vi.mocked(variableExpenseService.getVariableExpenses).mockResolvedValue([
        mockExpenseDb,
      ]);

      const response = await request(app).get(
        "/finance/variable-expense?categoryId=3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(200);
    });

    it("should return 400 when categoryId is not a uuid", async () => {
      const response = await request(app).get(
        "/finance/variable-expense?categoryId=invalid-id",
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when startDate is after endDate", async () => {
      const response = await request(app).get(
        "/finance/variable-expense?startDate=2025-12-31&endDate=2025-01-01",
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
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

    it("should return 500 when database fails", async () => {
      vi.mocked(variableExpenseService.getVariableExpenses).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).get("/finance/variable-expense");

      expect(response.status).toBe(500);
    });
  });

  describe("create variable expense", () => {
    it("should return 200 and create the expense", async () => {
      vi.mocked(variableExpenseService.createVariableExpense).mockResolvedValue(
        mockExpenseDb,
      );

      const response = await request(app)
        .post("/finance/variable-expense")
        .send({
          name: "Random Expense",
          amount: 234.45,
          expenseDate: "2025-04-01",
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockExpenseResponse);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 400 when name is missing", async () => {
      const response = await request(app)
        .post("/finance/variable-expense")
        .send({ amount: 234.45, expenseDate: "2025-04-01" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when amount is missing", async () => {
      const response = await request(app)
        .post("/finance/variable-expense")
        .send({ name: "Random Expense", expenseDate: "2025-04-01" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when expenseDate is missing", async () => {
      const response = await request(app)
        .post("/finance/variable-expense")
        .send({ name: "Random Expense", amount: 234.45 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when amount is negative", async () => {
      const response = await request(app)
        .post("/finance/variable-expense")
        .send({ name: "Random Expense", amount: -50, expenseDate: "2025-04-01" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when categoryId does not exist", async () => {
      vi.mocked(variableExpenseService.createVariableExpense).mockRejectedValue(
        new AppError("INVALID_REFERENCE", "Category not found", 404),
      );

      const response = await request(app)
        .post("/finance/variable-expense")
        .send({
          name: "Random Expense",
          amount: 234.45,
          expenseDate: "2025-04-01",
          categoryId: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("INVALID_REFERENCE");
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      });

      const response = await request(app)
        .post("/finance/variable-expense")
        .send({
          name: "Random Expense",
          amount: 234.45,
          expenseDate: "2025-04-01",
        });

      expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have area permission", async () => {
      requireAreaShouldFail = true;

      const response = await request(app)
        .post("/finance/variable-expense")
        .send({
          name: "Random Expense",
          amount: 234.45,
          expenseDate: "2025-04-01",
        });

      expect(response.status).toBe(403);
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(variableExpenseService.createVariableExpense).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app)
        .post("/finance/variable-expense")
        .send({
          name: "Random Expense",
          amount: 234.45,
          expenseDate: "2025-04-01",
        });

      expect(response.status).toBe(500);
    });
  });

  describe("update variable expense", () => {
    it("should return 200 and update the expense", async () => {
      vi.mocked(variableExpenseService.updateVariableExpense).mockResolvedValue({
        ...mockExpenseDb,
        name: "Updated Name",
      });

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        ...mockExpenseResponse,
        name: "Updated Name",
      });
      expect(response.body.error).toBeUndefined();
    });

    it("should return 400 when id is not a uuid", async () => {
      const response = await request(app)
        .patch("/finance/variable-expense/invalid-id")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when amount is negative", async () => {
      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ amount: -50 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when expense does not exist", async () => {
      vi.mocked(variableExpenseService.updateVariableExpense).mockRejectedValue(
        new AppError("NOT_FOUND", "variable expense not found", 404),
      );

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 when expense does not exist", async () => {
      vi.mocked(variableExpenseService.updateVariableExpense).mockRejectedValue(
        new AppError("NOT_FOUND", "variable expense not found", 404),
      );

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 422 when balance is insufficient", async () => {
      vi.mocked(variableExpenseService.updateVariableExpense).mockRejectedValue(
        new AppError("INSUFFICIENT_FUNDS", "Insufficient balance", 422),
      );

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ amount: 99999 });

      expect(response.status).toBe(422);
      expect(response.body.error.code).toBe("INSUFFICIENT_FUNDS");
    });

    it("should return 404 when id is missing", async () => {
      const response = await request(app)
        .patch("/finance/variable-expense")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(404);
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      });

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have area permission", async () => {
      requireAreaShouldFail = true;

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(403);
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(variableExpenseService.updateVariableExpense).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app)
        .patch("/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca")
        .send({ name: "Updated Name" });

      expect(response.status).toBe(500);
    });
  });

  describe("delete variable expense", () => {
    it("should return 200 and delete the expense", async () => {
      vi.mocked(variableExpenseService.deleteExpense).mockResolvedValue(
        mockExpenseDb,
      );

      const response = await request(app).delete(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(200);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 400 when id is not a uuid", async () => {
      const response = await request(app).delete(
        "/finance/variable-expense/invalid-id",
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when expense does not exist", async () => {
      vi.mocked(variableExpenseService.deleteExpense).mockRejectedValue(
        new AppError("NOT_FOUND", "variable expense not found", 404),
      );

      const response = await request(app).delete(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 404 when id is missing", async () => {
      const response = await request(app).delete("/finance/variable-expense");

      expect(response.status).toBe(404);
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
        next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
      });

      const response = await request(app).delete(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(401);
    });

    it("should return 403 when user does not have area permission", async () => {
      requireAreaShouldFail = true;

      const response = await request(app).delete(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(403);
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(variableExpenseService.deleteExpense).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).delete(
        "/finance/variable-expense/3fd12663-f4df-4fcf-a67a-83e3035338ca",
      );

      expect(response.status).toBe(500);
    });
  });
});