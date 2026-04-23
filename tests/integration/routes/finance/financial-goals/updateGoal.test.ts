import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import request from "supertest";
import app from "../../../../../src/app";
import { DurationUnit, InvestorStyle, Prisma } from "@prisma/client";
import { adjustBalanceWithTx } from "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";
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
    userArea: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock(
  "../../../../../src/modules/finance/shared/helpers/adjustBalanceWithTx.helper",
  () => ({
    adjustBalanceWithTx: vi.fn(),
  }),
);

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))


const mockTx = {
  financialGoal: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  financialCategory: {
    findFirst: vi.fn(),
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
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) =>
      fn(mockTx),
    );
    userHaveAccount = true
  });

  authMiddlewareTests("patch", `/finance/goals/${goalId}`, "FINANCES");

  describe("Happy path", () => {
    it("should return 200 and updated goal", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({
        ...mockGoal,
        name: "New name",
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ name: "New name" });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          updatedGoal: { ...expectedResponse, name: "New name" },
        },
      });
    });

    it("should decrement balance when initial amount increases", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({
        ...mockGoal,
        initialAmount: new Prisma.Decimal(100),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 100 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).toHaveBeenCalledWith(
        {
          tx: mockTx,
          userId,
          amount: 90,
          type: "DECREMENT",
          reason: "GOAL_UPDATE",
        },
      );
    });

    it("should increment balance when initial amount decreases", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });


      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue({
        ...mockGoal,
        initialAmount: new Prisma.Decimal(9),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 9 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).toHaveBeenCalledWith(
        {
          tx: mockTx,
          userId,
          amount: 1,
          type: "INCREMENT",
          reason: "GOAL_UPDATE",
        },
      );
    });

    it("should not adjust balance when initial amount does not change", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue(mockGoal);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 10 });

      expect(response.status).toBe(200);
      expect(adjustBalanceWithTx).not.toHaveBeenCalled();
    });

    it("should return new balance if balance was changed", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });
      vi.mocked(adjustBalanceWithTx).mockResolvedValue({
        balance: new Prisma.Decimal(100),
      } as any);
      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue(mockGoal);

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
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 10000000 });

      expect(response.status).toBe(400);
      expect(financialGoalsRepository.updateGoal).not.toHaveBeenCalled();
      expect(adjustBalanceWithTx).not.toHaveBeenCalled();
    });

    it("should throw 400 when target below initial amount", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ target: 9 });

      expect(response.status).toBe(400);
      expect(financialGoalsRepository.updateGoal).not.toHaveBeenCalled();
    });

    it("should throw 404 when goal is not found", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue(null);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ target: 9 });

      expect(response.status).toBe(404);
    });

    it("should throw 404 when categoryId is invalid", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      mockTx.financialCategory.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd0" });

      expect(response.status).toBe(404);
    });

    it("should not update goal if balance adjustment fails", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockResolvedValue({
        target: new Prisma.Decimal(10000),
        initialAmount: new Prisma.Decimal(10),
      });

      vi.mocked(financialGoalsRepository.updateGoal).mockResolvedValue(mockGoal);

      vi.mocked(adjustBalanceWithTx).mockRejectedValue(
        new Error("Balance error"),
      );

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 20 });

      expect(response.status).toBe(500);
    });

    it("should throw 500 for server errors", async () => {
      vi.mocked(financialGoalsRepository.getUniqueGoal).mockRejectedValue(new Error("Db error"));

      const response = await request(app)
        .patch(`/finance/goals/${goalId}`)
        .set("Authorization", `Bearer ${validToken}`)
        .send({ initialAmount: 20 });

      expect(response.status).toBe(500)
    })
  });

  describe("Zod validations", () => {
    describe("Type errors", () => {
      it.each([
        ["id", "uuid", "not-uuid"],
        ["name", "string", false],
        ["target", "number", "not-a-number"],
        ["initialAmount", "number", "not-a-number"],
        ["durationValue", "number", "not-a-number"],
        ["durationValue", "integer", 10.5],
        ["durationUnit", "valid value", "not-valid"],
        ["style", "valid value", "not-valid"],
        ["categoryId", "uuid", "not-uuid"]
      ])("should throw 400 if %s is not %s", async (field, _, value) => {
        const url = field === "id" ? "/finance/goals/123" : `/finance/goals/${goalId}`
        const bodyContent = field === "id" ? { name: "New name" } : { [field]: value }

        const response = await request(app)
          .patch(url)
          .set("Authorization", `Bearer ${validToken}`)
          .send(bodyContent)

        expect(response.status).toBe(400);
      })
    });

    describe("Value errors", () => {
      it("should throw 400 if target <= 0", async () => {
        const response = await request(app)
          .patch(`/finance/goals/${goalId}`)
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            target: 0
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
            initialAmount: -100
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
            durationValue: 0
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
            target: 100,
            initialAmount: 1000
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
