import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../../../../src/lib/prisma";
import {
  Prisma,
  DurationUnit,
  InvestorStyle
} from "@prisma/client";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { createGoalService } from "../../../../../src/modules/finance/financial-goals/services/createGoal.service";
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
    userArea: {
      findFirst: vi.fn(),
    }
  },
}));
vi.mock("../../../../../src/modules/finance/financial-goals/services/createGoal.service")

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))

const createdAt = new Date()
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

const correctRequest = {
  name: "goalName",
  target: 1000,
  initialAmount: 100,
  durationValue: 12,
  durationUnit: "MONTHS",
  style: "LOW",
  categoryId: "eba6db67-31b1-4e29-aeb9-bfc8fdf40fca",
}

const validToken = "validToken";

describe("POST /goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({
      userId: "userId",
    } as any);
    userHaveAccount = true
  });

  authMiddlewareTests("post", "/finance/goals", "FINANCES");

  describe("Happy path", () => {
    it("should return 201, goal data and new balance when categoryId is not null and valid", async () => {
      vi.mocked(createGoalService).mockResolvedValue({
        goal: mockGoal,
        newBalance: new Prisma.Decimal(100)
      })

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send(correctRequest);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(
        expect.objectContaining({
          data: {
            goal: { ...mockGoal, target: "1000", initialAmount: "100", createdAt: createdAt.toISOString() },
            newBalance: "100",
          },
        }),
      );
    });

    it("should return 201, goal data and new balance when categoryId is not provided", async () => {
      const { categoryId, ...correctRequestWithoutCategoryId } = correctRequest

      vi.mocked(createGoalService).mockResolvedValue({
        goal: { ...mockGoal, categoryId: null },
        newBalance: new Prisma.Decimal(100)
      })

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send(correctRequestWithoutCategoryId);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(
        expect.objectContaining({
          data: {
            goal: {
              ...mockGoal,
              target: "1000",
              initialAmount: "100",
              categoryId: null,
              createdAt: createdAt.toISOString()
            },
            newBalance: "100",
          },
        }),
      );
    });
  });

  describe("API errors", () => {
    it("should throw 404 (NOT_FOUND) when user does not have an account", async () => {
      userHaveAccount = false

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send(correctRequest);

      expect(response.status).toBe(404);
    });

    it("should map AppError from service correctly", async () => {
      vi.mocked(createGoalService).mockRejectedValue(
        new AppError("ANY_ERROR", "Some message", 418)
      )

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send(correctRequest);

      expect(response.status).toBe(418);
      expect(response.body.error).toMatchObject({
        code: "ANY_ERROR",
        message: "Some message",
      });
    });

    it("should throw 500 for server errors", async () => {
      vi.mocked(createGoalService).mockRejectedValue(new Error("Db error"))

      const response = await request(app)
        .post("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .send(correctRequest);

      expect(response.status).toBe(500)
    })
  });

  describe("Validation errors", () => {
    describe("Missing fields", () => {
      it.each([
        "name",
        "target",
        "initialAmount",
        "durationValue",
        "durationUnit"
      ])("should throw 400 if %s is not provided", async (field) => {
        const { [field as keyof typeof correctRequest]: _, ...partialRequest } = correctRequest

        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send(partialRequest)

        expect(response.status).toBe(400);
      })
    });

    describe("Type errors", () => {
      it.each([
        ["name", "string", 10],
        ["target", "number", "not-a-number"],
        ["initialAmount", "number", "not-a-number"],
        ["durationValue", "number", "not-a-number"],
        ["durationValue", "integer", 10.5],
        ["durationUnit", "valid value", "not-a-valid-value"],
        ["style", "valid value", "not-a-valid-value"],
        ["categoryId", "uuid", "not-a-uuid"]
      ])("should throw 400 if %s is not a %s", async (field, _, value) => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            ...correctRequest,
            [field]: value
          })

        expect(response.status).toBe(400);
      })
    });

    describe("Value errors", () => {
      it("should throw 400 if target <= 0", async () => {
        const response = await request(app)
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            ...correctRequest,
            target: 0
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
            ...correctRequest,
            initialAmount: -100
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
            ...correctRequest,
            durationValue: 0
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
            ...correctRequest,
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
          .post("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            ...correctRequest,
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
