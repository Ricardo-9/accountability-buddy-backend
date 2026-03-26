import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { financialCategoriesServices } from "../../../../../src/modules/finance/services/financialCategories.service.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";

const mockCategoryDb = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  userId: "user-123",
  name: "RANDOM_CATEGORY",
  isDefault: false,
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const mockCategoryResponse = {
  ...mockCategoryDb,
  createdAt: mockCategoryDb.createdAt.toISOString(),
  updatedAt: mockCategoryDb.updatedAt.toISOString(),
};

let requireAreaShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/services/financialCategories.service",
  () => ({
    financialCategoriesServices: {
      getCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
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

describe("financial categories", () => {
  describe("get categories", () => {
    it("should return 200 and categories", async () => {
      vi.mocked(financialCategoriesServices.getCategories).mockResolvedValue([
        mockCategoryDb as any,
      ]);

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockCategoryResponse]);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(
        async (_req, _res, next) => {
          next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
        },
      );

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(401);
    });
    it("should return 403 when user does not have area permission", async () => {
      requireAreaShouldFail = true;

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(403);
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(financialCategoriesServices.getCategories).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(500);
    });
  });

  describe("create category", () => {
    it("should return 200 and create the category", async () => {
      vi.mocked(financialCategoriesServices.createCategory).mockResolvedValue(
        mockCategoryDb,
      );

      const response = await request(app)
        .post("/finance/categories")
        .send({ name: "RANDOM_CATEGORY" });

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        ...mockCategoryResponse,
        name: "RANDOM_CATEGORY",
      });
      expect(response.body.error).toBeUndefined();
    });
  });

  it("should return 400 when name is missing", async () => {
    const response = await request(app).post("/finance/categories").send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).post("/finance/categories");

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "RANDOM_CATEGORY" });

    expect(response.status).toBe(403);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(financialCategoriesServices.createCategory).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app)
      .post("/finance/categories")
      .send({ name: "RANDOM_CATEGORY" });

    expect(response.status).toBe(500);
  });
});

describe("update categories", () => {
  it("should return 200 and update the category", async () => {
    vi.mocked(financialCategoriesServices.updateCategory).mockResolvedValue({
      ...mockCategoryDb,
      name: "NEW_NAME",
    });

    const response = await request(app)
      .patch("/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "NEW_NAME" });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      ...mockCategoryResponse,
      name: "NEW_NAME",
    });
    expect(response.body.error).toBeUndefined();
  });

  it("should return 400 when name is missing", async () => {
    const response = await request(app)
      .patch("/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 400 when id is not an uuid", async () => {
    const response = await request(app).patch("/finance/categories/123").send({ name: "NEW_NAME" });;

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).patch(
      "/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    ).send({ name: "NEW_NAME" });;

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app)
      .patch("/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "NEW_NAME" });

    expect(response.status).toBe(403);
  });
  

  it("should return 404 when id is missing", async () => {
    const response = await request(app)
      .patch("/finance/categories")
      .send({ name: "NEW_NAME" });

    expect(response.status).toBe(404);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(financialCategoriesServices.updateCategory).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app)
      .patch("/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca")
      .send({ name: "NEW_NAME" });

    expect(response.status).toBe(500);
  });
});

describe("delete category", () => {
  it("should return 200 and delete the category", async () => {
    vi.mocked(financialCategoriesServices.deleteCategory).mockResolvedValue();

    const response = await request(app).delete(
      "/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(200);
    expect(response.body.error).toBeUndefined();
  });

  it("should return 400 when id is not an uuid", async () => {
    const response = await request(app).delete("/finance/categories/123");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return 404 when id is missing", async () => {
    const response = await request(app).delete("/finance/categories");

    expect(response.status).toBe(404);
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).delete(
      "/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(401);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(financialCategoriesServices.deleteCategory).mockRejectedValue(
      new Error("DB error"),
    );

    const response = await request(app).delete(
      "/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(500);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).delete(
      "/finance/categories/3fd12663-f4df-4fcf-a67a-83e3035338ca",
    );

    expect(response.status).toBe(403);
  });
});
