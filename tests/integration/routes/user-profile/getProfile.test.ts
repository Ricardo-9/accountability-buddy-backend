import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../src/app";
import { AppError } from "../../../../src/core/errors/AppError";
import { authenticate } from "../../../../src/middlewares/authMiddleware";
import { getProfileService } from "../../../../src/modules/user/user-profile/services/getProfile.service";
import { profile } from "node:console";

const mockUserProfile = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  fullName: "João Silva",
  phone: "5588999887766",
  birthDate: new Date("1990-01-15"),
  status: "ACTIVE" as const,
};

vi.mock(
  "../../../../src/modules/user/user-profile/services/getProfile.service",
);

vi.mock("../../../../src/middlewares/authMiddleware", () => ({
  authenticate: vi.fn((req: any, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("get one category integration test", () => {
  it("should return the category for the user", async () => {
    vi.mocked(getProfileService).mockResolvedValue(mockUserProfile);

    const response = await request(app).get("/user/me");

    expect(response.body.data).toEqual({
      profile: {
        ...mockUserProfile,
        birthDate: new Date("1990-01-15").toISOString(),
      },
    });
    expect(response.status).toBe(200);
    expect(response.body.error).toBeUndefined();
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).get("/user/me");

    expect(response.status).toBe(401);
  });

  it("should return 404 when profile not found", async () => {
    vi.mocked(getProfileService).mockRejectedValue(
      new AppError("NOT_FOUND", "Profile not found", 404),
    );

    const response = await request(app).get("/user/me");

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Profile not found");
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(getProfileService).mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/user/me");

    expect(response.status).toBe(500);
  });
});
