import { describe, it, expect, beforeEach, vi } from "vitest";
import { authMiddlewareTests } from "../../../shared/authMiddlewareTests";
import { prisma } from "../../../../../src/lib/prisma";
import { Prisma, InvestorStyle, DurationUnit } from "@prisma/client";
import request from "supertest";
import app from "../../../../../src/app";
import { AppError } from "../../../../../src/core/errors/AppError";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";

vi.mock("jose", async (importOriginal) => {
  const original = await importOriginal<typeof import("jose")>();

  return {
    ...original,
    createRemoteJWKSet: vi.fn(),
    jwtVerify: vi.fn().mockResolvedValue({
      payload: {
        sub: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
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
    financialCategory: {
      findFirst: vi.fn(),
    },
  },
}));

let userHaveAccount: boolean

vi.mock("../../../../../src/modules/finance/middlewares/requireFinancialAccount", () => ({
  requireFinancialAccount: vi.fn((_req: any, _res: any, next: any) => {
    if (!userHaveAccount) {
      return next(new AppError("NOT_FOUND", "User account not found", 404))
    }
    next()
  })
}))

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")

const mockGoals = [
  {
    id: "0611d847-f9ca-4f0e-9b34-33b9250b42fe",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd0",
    name: "checkup",
    target: new Prisma.Decimal(500),
    initialAmount: new Prisma.Decimal(0),
    durationValue: 12,
    durationUnit: DurationUnit.WEEKS,
    style: InvestorStyle.MEDIUM,
    createdAt: new Date("2026-03-28T16:21:32.613Z"),
    updatedAt: new Date("2026-03-28T16:21:32.613Z"),
    deletedAt: null,
  },
  {
    id: "86e5d547-2523-4b77-a31e-7220d68d62a4",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "942c2acc-a35d-4127-a5d2-7fdfd9a60689",
    name: "buy a course",
    target: new Prisma.Decimal(200),
    initialAmount: new Prisma.Decimal(0),
    durationValue: 120,
    durationUnit: DurationUnit.MONTHS,
    style: InvestorStyle.MEDIUM,
    createdAt: new Date("2026-03-28T16:20:22.878Z"),
    updatedAt: new Date("2026-03-28T16:20:22.878Z"),
    deletedAt: null,
  },
  {
    id: "8c4ab071-fd20-444a-8bd3-f39e1dbe4a00",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
    name: "buy a farm",
    target: new Prisma.Decimal(10000000),
    initialAmount: new Prisma.Decimal(1000),
    durationValue: 120,
    durationUnit: DurationUnit.MONTHS,
    style: InvestorStyle.MEDIUM,
    createdAt: new Date("2026-03-27T16:11:22.487Z"),
    updatedAt: new Date("2026-03-27T16:11:22.487Z"),
    deletedAt: null,
  },
  {
    id: "2ddb9a9e-5b0b-4b58-b762-7a683773a033",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
    name: "buy a house",
    target: new Prisma.Decimal(10000000),
    initialAmount: new Prisma.Decimal(1000),
    durationValue: 120,
    durationUnit: DurationUnit.MONTHS,
    style: InvestorStyle.MEDIUM,
    createdAt: new Date("2026-03-26T22:20:36.802Z"),
    updatedAt: new Date("2026-03-26T22:20:36.802Z"),
    deletedAt: null,
  },
];

const expectedResponse = [
  {
    id: "0611d847-f9ca-4f0e-9b34-33b9250b42fe",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd0",
    name: "checkup",
    target: "500",
    initialAmount: "0",
    durationValue: 12,
    durationUnit: "WEEKS",
    style: "MEDIUM",
    createdAt: "2026-03-28T16:21:32.613Z",
    updatedAt: "2026-03-28T16:21:32.613Z",
  },
  {
    id: "86e5d547-2523-4b77-a31e-7220d68d62a4",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "942c2acc-a35d-4127-a5d2-7fdfd9a60689",
    name: "buy a course",
    target: "200",
    initialAmount: "0",
    durationValue: 120,
    durationUnit: "MONTHS",
    style: "MEDIUM",
    createdAt: "2026-03-28T16:20:22.878Z",
    updatedAt: "2026-03-28T16:20:22.878Z",
  },
  {
    id: "8c4ab071-fd20-444a-8bd3-f39e1dbe4a00",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
    name: "buy a farm",
    target: "10000000",
    initialAmount: "1000",
    durationValue: 120,
    durationUnit: "MONTHS",
    style: "MEDIUM",
    createdAt: "2026-03-27T16:11:22.487Z",
    updatedAt: "2026-03-27T16:11:22.487Z",
  },
  {
    id: "2ddb9a9e-5b0b-4b58-b762-7a683773a033",
    userId: "07c7db0b-8c87-4bc6-853b-1327afa6b262",
    categoryId: "c478795a-9215-4c25-9e7b-eefdc242b429",
    name: "buy a house",
    target: "10000000",
    initialAmount: "1000",
    durationValue: 120,
    durationUnit: "MONTHS",
    style: "MEDIUM",
    createdAt: "2026-03-26T22:20:36.802Z",
    updatedAt: "2026-03-26T22:20:36.802Z",
  },
];

const userId = "07c7db0b-8c87-4bc6-853b-1327afa6b262";

const validToken = "valid-token";

describe("GET /goals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.userArea.findFirst).mockResolvedValue({ userId } as any);
    userHaveAccount = true
  });

  authMiddlewareTests("get", "/finance/goals", "FINANCES");

  describe("Happy path", () => {
    it("should return 200 and goals", async () => {
      vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(mockGoals);

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          goals: expectedResponse,
          nextCursor: null,
        },
      });
    });

    it("should return limit items when has next page", async () => {
      vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(mockGoals);

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ limit: 3 });

      expect(response.body.data.goals).toHaveLength(3);
      expect(response.body.data.nextCursor).toBe(mockGoals[2].id);
    });

    it("should return nextCursor as null when goals.length <= limit", async () => {
      vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(
        mockGoals.slice(0, 2),
      );

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ limit: 3 });

      expect(response.body.data.nextCursor).toBeNull();
      expect(response.body.data.goals).toHaveLength(2);
    });
  });

  describe("Validation errors", () => {
    describe("Type errors", () => {
      it.each([
        ["categoryId", "uuid", "not-a-uuid"],
        ["cursor", "uuid", "not-a-uuid"],
        ["limit", "number", "not-a-number"],
        ["limit", "integer", 10.5]
      ])("should throw 400 if %s is not a %s", async (field, _, value) => {
        const response = await request(app)
          .get("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .query({ [field]: value });

        expect(response.status).toBe(400);
      })
    });

    describe("Value errors", () => {
      it("should throw 400 if limit < 1", async () => {
        const response = await request(app)
          .get("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .query({ limit: 0 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Limit must be at least 1",
        );
      });

      it("should throw 400 if limit > 100", async () => {
        const response = await request(app)
          .get("/finance/goals")
          .set("Authorization", `Bearer ${validToken}`)
          .query({ limit: 200 });

        expect(response.status).toBe(400);
        expect(response.body.error.details[0].message).toBe(
          "Limit must be at most 100",
        );
      });
    });
  });

  describe("API errors", () => {
    it("should throw 404 if user does not have a financial account", async () => {
      userHaveAccount = false

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it("should throw 404 if category is not valid", async () => {
      vi.mocked(prisma.financialCategory.findFirst).mockResolvedValue(null);

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`)
        .query({ categoryId: "3c53ba94-47b8-49c0-ac2a-0ec936316cd5" });

      expect(response.status).toBe(404);
    });

    it("should throw 500 for server errors", async () => {
      vi.mocked(financialGoalsRepository.getGoals).mockRejectedValue(new Error("Db error"))

      const response = await request(app)
        .get("/finance/goals")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(500);
    })
  });
});
