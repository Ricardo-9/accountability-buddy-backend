import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";
import { Prisma } from "@prisma/client";

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
    update: vi.fn(),
  },
  goalProgressSnapshot: {
    findFirst: vi.fn(),
  },
};

const validToken = "valid-token";
const goalId = "ef73a7fd-38b8-4aeb-9117-161e3d0fc137";
const userId = "83793157-f162-490c-b503-ea5983ab04b7";

describe("DELETE /goals/:id", () => {
  beforeEach(() => {
    (vi.clearAllMocks(),
      vi
        .mocked(prisma.$transaction)
        .mockImplementation(async (fn: any) => fn(mockTx)));
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId } as any);
    vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue({
      id: "acc-id",
    } as any);
  });

  authMiddlewareTests("delete", `/finance/goals/${goalId}`, "FINANCES");

  describe("Happy path", () => {
    it("should return 200, delete goal and refund amount to balance", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        initialAmount: new Prisma.Decimal(100),
      });
      mockTx.goalProgressSnapshot.findFirst.mockResolvedValue({
        totalDeposited: new Prisma.Decimal(1000),
      });
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(2000),
      } as any);

      const response = await request(app)
        .delete(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.refundedAmount).toBe("1100");
    });

    it("should refund only initial amount when no deposits exist", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        initialAmount: new Prisma.Decimal(100),
      });
      mockTx.goalProgressSnapshot.findFirst.mockResolvedValue(null);
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(2000),
      } as any);

      const response = await request(app)
        .delete(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.refundedAmount).toBe("100");
    });
  });

  describe("API validations", () => {
    it("should throw 404 if financial account does not exist", async () => {
      vi.mocked(prisma.financeAccount.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .delete(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("User account not found");
    });

    it("should throw 404 when goal does not exist", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.message).toBe("Financial goal not found");
    });
  });

  describe("Zod validations", () => {
    it("should throw 400 if id is invalid (not-uuid)", async () => {
      const response = await request(app)
        .delete(`/finance/goals/invalid`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error.details[0].message).toBe("Invalid id");
    });
  });
});
