import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma } from "@prisma/client";
import request from "supertest";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";
import { recurringTransactionRepository } from "../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository";

vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();

  return {
    ...original,
    createRemoteJWKSet: vi.fn(),
    jwtVerify: vi.fn().mockResolvedValue({
      payload: { sub: "userId", email: "user@test.com" },
    }),
  };
});
vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    userArea: { findFirst: vi.fn() },
    financialCategory: { findFirst: vi.fn() }
  },
}));
vi.mock("../../../../../src/modules/finance/recurring-transactions/repositories/recurringTransaction.repository")

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))

const validToken = "validToken";

const firstOccurrence = "2026-05-08";
const nextOccurrence = `${firstOccurrence}T00:00:00`;
const createdAt = "2026-04-09T12:18:22.718Z";

const mockTransaction = {
  type: "INCOME",
  name: "Transaction name",
  amount: 1000,
  recurrenceValue: 15,
  recurrenceUnit: "DAY",
  firstOccurrence,
  dayOfMonth: null,
  categoryId: null,
};

const mockDbValue = {
  id: "c027e992-9e54-4f2b-b131-e34e427cca58",
  userId: "userId",
  categoryId: null,
  type: "INCOME",
  name: "Transaction name",
  amount: new Prisma.Decimal(1000),
  recurrenceValue: 15,
  recurrenceUnit: "DAY",
  dayOfMonth: null,
  createdAt,
  nextOccurrence,
};

const expectedResponse = {
  ...mockDbValue,
  amount: "1000",
};

describe("POST /transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({
      userId: "userId",
    } as any);
    userHaveAccount = true
  });

  authMiddlewareTests("post", "/finance/transactions", "FINANCES");

  describe("Happy path", () => {
    it("should return 201 and transaction data when both categoryId and dayOfMonth are null", async () => {
      vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockResolvedValue(
        mockDbValue as any,
      );

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send(mockTransaction);

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(expectedResponse);
    });

    it("should return 201 and transaction data when categoryId is not null and valid", async () => {
      const categoryId = "83793157-f162-490c-b503-ea5983ab04b7";

      vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockResolvedValue({
        ...mockDbValue,
        categoryId,
      } as any);
      vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue({
        id: categoryId,
      } as any);

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ ...mockTransaction, categoryId });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual({ ...expectedResponse, categoryId });
    });

    it("should return 201 and transaction data when dayOfMonth is not null and valid", async () => {
      vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockResolvedValue({
        ...mockDbValue,
        recurrenceUnit: "MONTH",
        dayOfMonth: 8,
      } as any);

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ ...mockTransaction, recurrenceUnit: "MONTH", dayOfMonth: 8 });

      expect(response.status).toBe(201);
      expect(response.body.data).toEqual({
        ...expectedResponse,
        recurrenceUnit: "MONTH",
        dayOfMonth: 8,
      });
    });
  });

  describe("API errors", () => {
    it("should throw 404 if categoryId is not null but invalid", async () => {
      const categoryId = "83793157-f162-490c-b503-ea5983ab04b7";

      vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ ...mockTransaction, categoryId });

      expect(response.status).toBe(404);
      expect(response.body.error).toMatchObject({
        code: "NOT_FOUND",
        message: "Category not found",
      });
    });

    it("should throw 404 if user account is not found", async () => {
      userHaveAccount = false

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send(mockTransaction);

      expect(response.status).toBe(404);
      expect(response.body.error).toMatchObject({
        code: "NOT_FOUND",
        message: "User account not found",
      });
    });

    it("should throw 500 if database fails", async () => {
      vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockRejectedValue(
        new Error("Db error"),
      );

      const response = await request(app)
        .post("/finance/transactions")
        .set("Authorization", `Bearer ${validToken}`)
        .send(mockTransaction);

      expect(response.status).toBe(500);
    });
  });

  describe("Zod validation", () => {
    describe("Missing fields", () => {
      it.each([
        "type",
        "name",
        "amount",
        "recurrenceValue",
        "recurrenceUnit",
        "firstOccurrence"
      ])("should throw 400 if %s is missing", async (field) => {
        const { [field as keyof typeof mockTransaction]: _, ...rest } = mockTransaction

        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send(rest)

        expect(response.status).toBe(400)
      })
    });

    describe("Type errors", () => {
      it.each([
        ["type", "valid value", "not-valid"],
        ["name", "string", 123],
        ["amount", "number", "not-a-number"],
        ["recurrenceValue", "number", "not-a-number"],
        ["recurrenceValue", "integer", 10.4],
        ["recurrenceUnit", "valid value", "not-valid"],
        ["firstOccurrence", "date", "not-a-date"],
        ["categoryId", "uuid", "not-uuid"],
        ["dayOfMonth", "number", "not-a-number"],
        ["dayOfMonth", "integer", 10.3]
      ])("should throw 400 if %s is not %s", async (field, _, value) => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, [field]: value });

        expect(response.status).toBe(400)
      })
    });

    describe("Value errors", () => {
      it("should throw 400 if amount <= 0", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, amount: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Amount value must be greater than $0",
        );
      });

      it("should throw 400 if recurrenceValue < 1", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, recurrenceValue: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Recurrence value must be at least 1",
        );
      });

      it("should throw 400 if dayOfMonth <= 0", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, dayOfMonth: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Day of month must be greater than 0",
        );
      });

      it("should throw 400 if dayOfMonth > 31", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, dayOfMonth: 32 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Day of month cannot be greater than 31",
        );
      });
    });

    describe("Refine errors", () => {
      it("should throw 400 if firstOccurrence is in the past", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, firstOccurrence: "2025-04-08" });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "First ocurrence cannot be in the past",
        );
      });

      it("should throw 400 if dayOfMonth is not provided when recurrenceUnit = MONTH", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, recurrenceUnit: "MONTH" });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Day of month is required for monthly recurrence",
        );
      });

      it("should throw 400 if first ocurrence don't match dayOfMonth", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            ...mockTransaction,
            recurrenceUnit: "MONTH",
            firstOccurrence: "2026-05-09",
            dayOfMonth: 5,
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "First occurrence must match day of month",
        );
      });

      it("should throw 400 if dayOfMonth is provided when recurrenceUnit = DAY", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, recurrenceUnit: "DAY", dayOfMonth: 5 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "dayOfMonth should not be provided for daily or weekly recurrence",
        );
      });

      it("should throw 400 if dayOfMonth is provided when recurrenceUnit = WEEK", async () => {
        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, recurrenceUnit: "WEEK", dayOfMonth: 5 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "dayOfMonth should not be provided for daily or weekly recurrence",
        );
      });
    });

    describe("Transform values", () => {
      it("should transform firstOcurrence", async () => {
        vi.mocked(recurringTransactionRepository.createRecurringTransaction).mockResolvedValue({
          id: "rec-id",
        } as any);

        const response = await request(app)
          .post("/finance/transactions")
          .set("Authorization", `Bearer ${validToken}`)
          .send({ ...mockTransaction, firstOccurrence: "2026-12-25" });

        expect(response.status).toBe(201);
        expect(recurringTransactionRepository.createRecurringTransaction).toHaveBeenCalledWith(
          expect.anything(),
          "userId",
          expect.objectContaining({
            nextOccurrence: new Date("2026-12-25T00:00:00"),
          }),
        );
      });
    });
  });
});
