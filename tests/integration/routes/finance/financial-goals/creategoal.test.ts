import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../../../../src/lib/prisma";
import {
  Prisma,
  DurationUnit,
  InvestorStyle,
  FinanceAccount,
} from "@prisma/client";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";

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
    financeAccount: {
      findUnique: vi.fn(),
    },
    userArea: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));
vi.mock(
  "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper",
);

const txMock = {
  financeAccount: {
    findUnique: vi.fn(),
  },
  financialCategory: {
    findFirst: vi.fn(),
  },
  financialGoal: {
    create: vi.fn(),
  },
};
const adjustBalanceWithTxMock = vi.mocked(adjustBalanceWithTx);

const createdAt = new Date().toISOString();
const mockGoal = {
  id: "goalId",
  userId: "userId",
  name: "goalName",
  target: new Prisma.Decimal(1000),
  initialAmount: new Prisma.Decimal(100),
  durationValue: 12,
  durationUnit: DurationUnit.MONTHS,
  style: InvestorStyle.LOW,
  categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
  createdAt,
};

const validToken = "validToken";

describe("POST /goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (fn) =>
      fn(txMock as any),
    );
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({
      id: "accId",
    } as any);
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({
      userId: "userId",
    } as any);
  });

  authMiddlewareTests("post", "/finance/goals", "FINANCES");

  describe("Happy path", () => {
    beforeEach(() =>
      vi
        .mocked(txMock.financeAccount.findUnique)
        .mockResolvedValue({ userId: "userId" }),
    );

    it("should return 201, goal data and new balance when categoryId is not null and valid", async () => {
      txMock.financialCategory.findFirst.mockResolvedValue({
        id: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
      });
      txMock.financialGoal.create.mockResolvedValue(mockGoal);
      adjustBalanceWithTxMock.mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as unknown as FinanceAccount);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
          categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(
        expect.objectContaining({
          data: {
            goal: { ...mockGoal, target: "1000", initialAmount: "100" },
            newBalance: "100",
          },
        }),
      );
    });

    it("should successfully decrement balance", async () => {
      txMock.financialCategory.findFirst.mockResolvedValue({
        id: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
      });
      txMock.financialGoal.create.mockResolvedValue(mockGoal);
      adjustBalanceWithTxMock.mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as unknown as FinanceAccount);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
          categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
        });

      expect(adjustBalanceWithTx).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 100,
          type: "DECREMENT",
          reason: "GOAL_CREATE",
        }),
      );
    });

    it("should return 201, goal data and new balance when categoryId null", async () => {
      txMock.financialGoal.create.mockResolvedValue({
        ...mockGoal,
        categoryId: null,
      });
      adjustBalanceWithTxMock.mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as unknown as FinanceAccount);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
          categoryId: null,
        });

      expect(txMock.financialCategory.findFirst).not.toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        data: {
          goal: {
            ...mockGoal,
            target: "1000",
            initialAmount: "100",
            categoryId: null,
          },
          newBalance: "100",
        },
      });
    });

    it("should return 201, goal data and new balance when categoryId is not provided", async () => {
      txMock.financialGoal.create.mockResolvedValue({
        ...mockGoal,
        categoryId: null,
      });
      adjustBalanceWithTxMock.mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as unknown as FinanceAccount);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
        });

      expect(txMock.financialGoal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ categoryId: null }),
        }),
      );
      expect(txMock.financialCategory.findFirst).not.toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(
        expect.objectContaining({
          data: {
            goal: {
              ...mockGoal,
              target: "1000",
              initialAmount: "100",
              categoryId: null,
            },
            newBalance: "100",
          },
        }),
      );
    });
  });

  describe("API errors", () => {
    it("should throw 404 (NOT_FOUND) when user does not have an account", async () => {
      vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
          categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
        });

      expect(response.status).toBe(404);
    });

    it("should throw 404 (NOT_FOUND) when category id is not valid", async () => {
      txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" });
      txMock.financialCategory.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
          categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
        });

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        error: {
          code: "NOT_FOUND",
          message: "Category not found",
        },
      });
    });

    it("should throw 422 (INSUFFICIENT_FUNDS) when balance < initialAmount", async () => {
      txMock.financeAccount.findUnique.mockResolvedValue({ userId: "userId" });
      adjustBalanceWithTxMock.mockRejectedValue(
        new AppError("INSUFFICIENT_FUNDS", "Insufficient balance", 422),
      );

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "goalName",
          target: 1000,
          initialAmount: 100,
          durationValue: 12,
          durationUnit: "MONTHS",
          style: "LOW",
        });

      expect(response.status).toBe(422);
    });
  });

  describe("Validation errors", () => {
    describe("Missing fields", () => {
      it("should throw 400 if name is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe("Name is required");
      });

      it("should throw 400 if target is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Target is required",
        );
      });

      it("should throw 400 if initialAmount is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Initial amount is required",
        );
      });

      it("should throw 400 if durationValue is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Duration value is required",
        );
      });

      it("should throw 400 if durationUnit is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Invalid duration unit",
        );
      });

      it("should throw 400 if style is not provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Invalid investor style",
        );
      });
    });
    describe("Type errors", () => {
      it("should throw 400 if name is not a string", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: 1,
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Name must be a string",
        );
      });

      it("should throw 400 if target is not a number", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: "1000",
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Target must be a number",
        );
      });

      it("should throw 400 if initialAmount is not a number", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: "100",
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Initial amount must be a number",
        );
      });

      it("should throw 400 if durationValue is not a number", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: "12",
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Duration value must be a number",
        );
      });

      it("should throw 400 if duration value is not a integer", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12.5,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Duration must be an integer",
        );
      });

      it("should throw 400 if duration unit is not a valid value", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "CENTURIES",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Invalid duration unit",
        );
      });

      it("should throw 400 if style is not a valid value", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "HIP-HOP",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Invalid investor style",
        );
      });

      it("should throw 400 if category is not an uuid", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
            categoryId: "not-uuid",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Invalid category id",
        );
      });
    });

    describe("Value errors", () => {
      it("should throw 400 if target <= 0", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 0,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Target value must be greater than $0",
        );
      });

      it("should throw 400 if initialAmount is negative", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: -100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Initial amount cannot be negative",
        );
      });

      it("should throw 400 if durationValue < 1", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 0,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Duration must be at least 1",
        );
      });
    });
    describe("API validations", () => {
      it("should throw 400 if initialAmount > target", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 100,
            initialAmount: 1000,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Initial amount cannot be greater than target value",
        );
      });

      it("should throw 400 if unexpected params are provided", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalName",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
            unexpected: "param",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          'Unrecognized key: "unexpected"',
        );
      });
    });
  });
});
