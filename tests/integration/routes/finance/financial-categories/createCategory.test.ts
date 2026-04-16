import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { createCategoryService } from "../../../../../src/modules/finance/financial-categories/services/createCategory.service.js";

const mockCategory = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  name: "MOCKCATEGORY",
  isDefault: false,
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const mockCategoryResponse = {
  ...mockCategory,
  updatedAt: mockCategory.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/financial-categories/services/createCategory.service.js",
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

describe("create category integration test", () => {
  (it("should create and return the category for the user", async () => {
    vi.mocked(createCategoryService).mockResolvedValue(mockCategory);

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "MOCKCATEGORY" });

    expect(response.body.data).toEqual({ category: mockCategoryResponse });
    expect(response.status).toBe(200);
  }),
    it("should return 400 when name does not exist", async () => {
      const response = await request(app).post("/finance/categories");

      expect(response.status).toBe(400);
    }));
  it("should return 400 when name is too short", async () => {
    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "A" });

    expect(response.status).toBe(400);
  });
  it("should return 400 when name is too long", async () => {
    const response = await request(app).post("/finance/categories").send({
      name: "DDLpTqRvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdE",
    });

    expect(response.status).toBe(400);
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "mockCategory" });

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "mockCategory" });

    expect(response.status).toBe(403);
  });

  it("should throw error 404 (NOT_FOUND) if user does not have an account", async () => {
    requireFinancialAccountShouldFail = true;
    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "mockCategory" });
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("User account not found");
  });

  it("should throw error 409 (DUPLICATE_REGISTER) if category already exist", async () => {
    const duplicateError = new AppError(
      "DUPLICATE_REGISTER",
      "The user already registered this category",
      409,
    );
    vi.mocked(createCategoryService).mockRejectedValue(duplicateError);
    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "mockCategory" });
    expect(response.status).toBe(409);
    expect(response.body.error.message).toBe(
      "The user already registered this category",
    );
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(createCategoryService).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "mockCategory" });

    expect(response.status).toBe(500);
  });
});
