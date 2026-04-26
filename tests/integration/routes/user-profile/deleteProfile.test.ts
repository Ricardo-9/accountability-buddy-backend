import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../src/app";
import { AppError } from "../../../../src/core/errors/AppError";
import { authenticate } from "../../../../src/middlewares/authMiddleware";
import { deleteProfileService } from "../../../../src/modules/user/user-profile/services/deleteProfile.service";
import { ProfileStatus } from "@prisma/client";

const mockUserProfile = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  fullName: "João Silva",
  phone: "5588999887766",
  birthDate: new Date("1990-01-15"),
  status: "DELETED" as ProfileStatus,
};

const mockUserProfileResponse = {
  ...mockUserProfile,
  birthDate: mockUserProfile.birthDate.toISOString(),
};

vi.mock(
  "../../../../src/modules/user/user-profile/services/deleteProfile.service",
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

describe("delete profile integration test", () => {
  it("should delete profile successfully", async () => {
    vi.mocked(deleteProfileService).mockResolvedValue(mockUserProfile);

    const response = await request(app).delete("/user/me");

    expect(response.body.data).toEqual({
      profile: mockUserProfileResponse,
    });

    expect(response.body.message).toBe(
      "User profile sucessfully deleted",
    );

    expect(response.status).toBe(200);

    expect(deleteProfileService).toHaveBeenCalledWith("user-123");
  });

  it("should return 401 when user is not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app).delete("/user/me");

    expect(response.status).toBe(401);
  });

  it("should return 404 when profile not found", async () => {
    vi.mocked(deleteProfileService).mockRejectedValue(
      new AppError("NOT_FOUND", "profile not found", 404),
    );

    const response = await request(app).delete("/user/me");

    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("profile not found");
  });

  it("should return 502 when supabase deletion fails", async () => {
    vi.mocked(deleteProfileService).mockRejectedValue(
      new AppError(
        "DELETE_ERROR",
        "Failed to deactivate account in authentication system",
        502,
      ),
    );

    const response = await request(app).delete("/user/me");

    expect(response.status).toBe(502);
    expect(response.body.error.message).toBe(
      "Failed to deactivate account in authentication system",
    );
  });

  it("should return 500 when unexpected error happens", async () => {
    vi.mocked(deleteProfileService).mockRejectedValue(
      new Error("Unexpected error"),
    );

    const response = await request(app).delete("/user/me");

    expect(response.status).toBe(500);
  });
});