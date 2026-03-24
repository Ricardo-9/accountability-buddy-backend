import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../src/app.js";
import { financialCategoriesServices } from "../../../../src/modules/finance/services/financialCategories.service";
import { AppError } from "../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../src/middlewares/authMiddleware.js";

const mockCategory = {
  id: "category-123",
  userId: "user-123",
  name: "RANDOM_CATEGORY",
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let requireAreaShouldFail = false;

vi.mock(
  "../../../../src/modules/finance/services/financialCategories.service",
  () => ({
    financialCategoriesServices: {
      getCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    },
  }),
);

vi.mock("../../../../src/middlewares/authMiddleware.ts", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock("../../../../src/middlewares/requireArea.js", () => ({
  requireArea: vi.fn(() => (_req: any, _res: any, next: any) => {
    if (requireAreaShouldFail) {
      next(
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

describe("financial categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get categories", () => {
    it("should return 200 and categories", async () => {
      vi.mocked(financialCategoriesServices.getCategories).mockResolvedValue([
        mockCategory as any,
      ]);

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockCategory]);
      expect(response.body.error).toBeUndefined();
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(financialCategoriesServices.getCategories).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(500);
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
  });
});
