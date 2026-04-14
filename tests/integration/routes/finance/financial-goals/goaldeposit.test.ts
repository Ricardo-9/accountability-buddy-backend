import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";
import { Prisma } from "@prisma/client";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();

  return {
    ...original,
    createRemoteJWKSet: vi.fn(),
    jwtVerify: vi.fn().mockResolvedValue({
      payload: {
        sub: "83793157-f162-490c-b503-ea5983ab04b7",
        email: "user@test.com",
      },
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
  () => ({
    adjustBalanceWithTx: vi.fn(),
  }),
);

const mockTx = {
  financialGoal: {
    findUnique: vi.fn(),
  },
  goalDeposit: {
    create: vi.fn(),
  },
  goalProgressSnapshot: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
};

const validToken = "valid-token";
const goalId = "ef73a7fd-38b8-4aeb-9117-161e3d0fc137";
const userId = "83793157-f162-490c-b503-ea5983ab04b7";
const createdAt = new Date();

const mockDeposit = {
  id: "deposit-id",
  goalId,
  userId,
  amount: new Prisma.Decimal(1000),
  createdAt,
};

const expectedResponse = {
  id: "deposit-id",
  goalId,
  userId,
  amount: "1000",
  createdAt: createdAt.toISOString(),
};

describe("POST /goals/deposit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId } as any);
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({
      id: "acc-id",
    } as any);
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(mockTx),
    );
  });

  authMiddlewareTests("post", `/finance/goals/deposit/${goalId}`, "FINANCES");

  describe("Happy path", () => {
    it("should return 200, goal deposit and new balance", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId });
      mockTx.goalDeposit.create.mockResolvedValue(mockDeposit);
      mockTx.goalProgressSnapshot.findFirst.mockResolvedValue(null);
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(2000),
      } as any);

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          deposit: expectedResponse,
          newBalance: "2000",
        },
      });
    });

    it("should accumulate total deposited from last snapshot", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId });
      mockTx.goalDeposit.create.mockResolvedValue(mockDeposit);
      mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({
        totalDeposited: new Prisma.Decimal(100),
      });
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(2000),
      } as any);

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(200);
      expect(mockTx.goalProgressSnapshot.create).toHaveBeenCalledWith({
        data: {
          goalId,
          totalDeposited: new Prisma.Decimal(1100),
        },
      });
    });
  });

  describe("API validations", () => {
    it("should throw 404 if financial account does not exist", async () => {
      vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("User account not found");
    });

    it("should throw 404 if financial goal does not exist", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Financial goal not found");
    });

    it("should return 422 if insufficient funds", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId });

      vi.mocked(adjustBalanceWithTx).mockRejectedValue(
        new AppError("INSUFFICIENT_FUNDS", "Insufficient balance", 422),
      );

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(422);
      expect(response.body.error.message).toBe("Insufficient balance");
    });

    it("should throw 500 if internal errors occurs", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({ id: goalId });
      mockTx.goalDeposit.create.mockResolvedValue(mockDeposit);
      mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({
        totalDeposited: new Prisma.Decimal(100),
      });
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(2000),
      } as any);
      mockTx.goalProgressSnapshot.create.mockRejectedValue(
        new Error("Db error"),
      );

      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(500);
    });
  });

  describe("Zod validations", () => {
    it("should thrrow 400 if id is invalid", async () => {
      const response = await request(app)
        .post(`/finance/goals/deposit/id`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe("Invalid goal id");
    });

    it("should throw 400 if amount is not provided", async () => {
      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe("Amount is required");
    });

    it("should thrrow 400 if amount is invalid", async () => {
      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: "1000" });

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe(
        "Invalid amount value",
      );
    });

    it("should throw 400 if amount <= 0", async () => {
      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe(
        "Amount must be greater than $0",
      );
    });

    it("should throw 400 if body is not valid", async () => {
      const response = await request(app)
        .post(`/finance/goals/deposit/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send(undefined);

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe(
        "Invalid request body",
      );
    });
  });
});
