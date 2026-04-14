import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";
import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/helpers/adjustBalanceWithTx.helper";

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
  financialCategory: {
    findUnique: vi.fn(),
  },
};

const mockGoal = {
  id: "ef73a7fd-38b8-4aeb-9117-161e3d0fc137",
  userId: "83793157-f162-490c-b503-ea5983ab04b7",
  categoryId: null,
  name: "BULKING",
  target: new Prisma.Decimal(10000),
  durationValue: 12,
  durationUnit: DurationUnit.WEEKS,
  style: InvestorStyle.MEDIUM,
  initialAmount: new Prisma.Decimal(10),
  createdAt: new Date("2026-03-30T18:21:55.565Z"),
  updatedAt: new Date("2026-03-30T23:55:27.435Z"),
};

const expectedResponse = {
  id: "ef73a7fd-38b8-4aeb-9117-161e3d0fc137",
  userId: "83793157-f162-490c-b503-ea5983ab04b7",
  categoryId: null,
  name: "BULKING",
  target: "10000",
  durationValue: 12,
  durationUnit: "WEEKS",
  style: "MEDIUM",
  initialAmount: "10",
  createdAt: "2026-03-30T18:21:55.565Z",
  updatedAt: "2026-03-30T23:55:27.435Z",
};

const userId = "83793157-f162-490c-b503-ea5983ab04b7";
const goalId = "ef73a7fd-38b8-4aeb-9117-161e3d0fc137";

const validToken = "valid-token";

describe("PATCH /goals", () => {
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

  authMiddlewareTests("patch", `/finance/goals/${goalId}`, "FINANCES");

  describe("Happy path", () => {
    it("should return 200 and updated goal", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialGoal.update.mockResolvedValue({
        ...mockGoal,
        name: "New name",
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "New name" });

      expect(response.status).toBe(200);
      expect(mockTx.financialGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: goalId, userId },
          data: expect.objectContaining({
            name: "New name",
          }),
        }),
      );
      expect(response.body).toMatchObject({
        data: {
          updatedGoal: { ...expectedResponse, name: "New name" },
        },
      });
    });

    it("should decrement balance when initial amount increases", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialGoal.update.mockResolvedValue({
        ...mockGoal,
        initialAmount: new Prisma.Decimal(100),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 100 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          amount: 90,
          type: "DECREMENT",
          reason: "GOAL_UPDATE",
        }),
      );
    });

    it("should increment balance when initial amount decreases", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialGoal.update.mockResolvedValue({
        ...mockGoal,
        initialAmount: new Prisma.Decimal(9),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 9 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          amount: 1,
          type: "INCREMENT",
          reason: "GOAL_UPDATE",
        }),
      );
    });

    it("should not adjust balance when initial amount does not change", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialGoal.update.mockResolvedValue(mockGoal);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 10 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).not.toHaveBeenCalled();
    });

    it("should return new balance if balance was changed", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as any);
      mockTx.financialGoal.update.mockResolvedValue(mockGoal);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 11 });

      expect(response.status).toBe(200);
      expect(response.body.data.newBalance).toBe("100");
    });
  });

  describe("API validations", () => {
    it("should throw 400 when initial amount is greater than target", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 10000000 });

      expect(response.status).toBe(400);
      expect(mockTx.financialGoal.update).not.toHaveBeenCalled();
      expect(adjustBalanceWithTx).not.toHaveBeenCalled();
    });

    it("should throw 400 when target below initial amount", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ target: 9 });

      expect(response.status).toBe(400);
      expect(mockTx.financialGoal.update).not.toHaveBeenCalled();
    });

    it("should throw 404 when goal is not found", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ target: 9 });

      expect(response.status).toBe(404);
    });

    it("should throw 404 when categoryId is invalid", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialCategory.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd0" });

      expect(response.status).toBe(404);
    });

    it("should not update goal if balance adjustment fails", async () => {
      mockTx.financialGoal.findUnique.mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialGoal.update.mockResolvedValue(mockGoal);

      vi.mocked(adjustBalanceWithTx).mockRejectedValue(
        new Error("Balance error"),
      );

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 20 });

      expect(response.status).toBe(500);
    });
  });

  describe("Zod validations", () => {
    describe("Type errors", () => {
      it("should throw 400 if id is not uuid", async () => {
        const response = await request(app)
          .patch(`/finance/goals/123`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            name: "goalname",
            target: 1000,
            initialAmount: 100,
            durationValue: 12,
            durationUnit: "MONTHS",
            style: "LOW",
          });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe("Invalid id");
      });

      it("should throw 400 if name is not a string", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          "Invalid goal name",
        );
      });

      it("should throw 400 if target is not a number", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          "Invalid target value",
        );
      });

      it("should throw 400 if initialAmount is not a number", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          "Invalid initial amount value",
        );
      });

      it("should throw 400 if durationValue is not a number", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          "Invalid duration value",
        );
      });

      it("should throw 400 if duration value is not a integer", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
    describe("Extra checks", () => {
      it("should throw 400 if initialAmount > target", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
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
          .patch(`/finance/goals/${goalId}`)
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
          "Invalid request body",
        );
      });
    });
  });
});
