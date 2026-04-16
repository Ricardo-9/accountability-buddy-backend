import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../../src/app.js";
import { AppError } from "../../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../../src/middlewares/authMiddleware.js";
import { getCategoriesService } from "../../../../../src/modules/finance/financial-categories/services/getCategories.service.js";

const mockCategories = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "FOOD",
    isDefault: false,
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "TRANSPORT",
    isDefault: false,
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
  },
];

let requireAreaShouldFail = false;
let requireFinancialAccountShouldFail = false;

vi.mock(
  "../../../../../src/modules/finance/financial-categories/services/getCategories.service.js",
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

describe("get categories integration test", () => {
  it("should return categories", async () => {
    vi.mocked(getCategoriesService).mockResolvedValue(mockCategories);

    const response = await request(app).get("/finance/categories");

    expect(response.status).toBe(200);
    expect(response.body.data.categories).toHaveLength(2);
    expect(response.body.data.nextCursor).toBeNull();

    expect(getCategoriesService).toHaveBeenCalledWith(
      "user-123",
      10,
      undefined,
    );
  });

  it("should return nextCursor when has next page", async () => {
    vi.mocked(getCategoriesService).mockResolvedValue([
      ...mockCategories,
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "EXTRA",
        isDefault: false,
        updatedAt: new Date(),
      },
    ]);

    const response = await request(app).get("/finance/categories?limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data.nextCursor).toBe(
      "22222222-2222-2222-2222-222222222222",
    );
  });

  it("should support cursor pagination", async () => {
    const cursor = "3fd12663-f4df-4fcf-a67a-83e3035338ca";
    vi.mocked(getCategoriesService).mockResolvedValue(mockCategories);

    const response = await request(app).get(
      `/finance/categories?limit=2&cursor=${cursor}`,
    );

    expect(response.status).toBe(200);

    expect(getCategoriesService).toHaveBeenCalledWith("user-123", 2, cursor);
  });

  it("should return 400 when limit is invalid", async () => {
    const response = await request(app).get("/finance/categories?limit=0");

    expect(response.status).toBe(400);
  });

  it("should return 400 when cursor is invalid", async () => {
    const response = await request(app).get(
      "/finance/categories?cursor=invalid",
    );

    expect(response.status).toBe(400);
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).get("/finance/categories");

    expect(response.status).toBe(401);
  });

  it("should return 403 when user does not have area permission", async () => {
    requireAreaShouldFail = true;

    const response = await request(app).get("/finance/categories");

    expect(response.status).toBe(403);
  });

  it("should return 404 when user does not have account", async () => {
    requireFinancialAccountShouldFail = true;

    const response = await request(app).get("/finance/categories");

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("User account not found");
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(getCategoriesService).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/finance/categories");

    expect(response.status).toBe(500);
  });
});
