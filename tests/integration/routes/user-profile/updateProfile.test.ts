import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../src/app";
import { AppError } from "../../../../src/core/errors/AppError";
import { authenticate } from "../../../../src/middlewares/authMiddleware";
import { updateProfileService } from "../../../../src/modules/user/user-profile/services/updateProfile.service";
import { ProfileStatus } from "@prisma/client";

const mockUserProfile = {
  id: "3fd12663-f4df-4fcf-a67a-83e3035338ca",
  fullName: "João Silva",
  phone: "5588999887766",
  birthDate: new Date("1990-01-15"),
  status: "ACTIVE" as ProfileStatus,
};

vi.mock(
  "../../../../src/modules/user/user-profile/services/updateProfile.service",
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

describe("update variable expense integration test", () => {
  it("should update variable expense successfully", async () => {
    vi.mocked(updateProfileService).mockResolvedValue({
      ...mockUserProfile,
      fullName: "Updated Name",
      phone: "5588999894567",
      birthDate: new Date("2008-04-01"),
    });

    const response = await request(app)
      .patch("/user/me")
      .send({
        fullName: "Updated Name",
        phone: "+5588999894567",
        birthDate: new Date("2008-04-01"),
      });

    expect(response.status).toBe(200);

    expect(response.body.data).toEqual({
      profile: {
        ...mockUserProfile,
        phone: "5588999894567",
        fullName: "Updated Name",
        birthDate: new Date("2008-04-01").toISOString(),
      },
    });

    expect(response.body.error).toBeUndefined();
  });

  it("should update only fullName", async () => {
    vi.mocked(updateProfileService).mockResolvedValue({
      ...mockUserProfile,
      fullName: "Updated Name",
    });

    const response = await request(app).patch("/user/me").send({
      fullName: "Updated Name",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      profile: {
        ...mockUserProfile,
        birthDate: new Date("1990-01-15").toISOString(),
        fullName: "Updated Name",
      },
    });
  });

  it("should update only birthDate", async () => {
    vi.mocked(updateProfileService).mockResolvedValue({
      ...mockUserProfile,
      birthDate: new Date("2008-04-01"),
    });

    const response = await request(app)
      .patch("/user/me")
      .send({
        birthDate: new Date("2008-04-01"),
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      profile: {
        ...mockUserProfile,
        birthDate: new Date("2008-04-01").toISOString(),
      },
    });
  });

  it("should update only phone", async () => {
    vi.mocked(updateProfileService).mockResolvedValue({
      ...mockUserProfile,
      phone: "5588999894567",
    });

    const response = await request(app).patch("/user/me").send({
      phone: "+5588999894567",
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      profile: {
        ...mockUserProfile,
        birthDate: new Date("1990-01-15").toISOString(),
        phone: "5588999894567",
      },
    });
  });

  it("should return 400 when body fails validation", async () => {
      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: 123 });

      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
    

  it("should return 401 when user not authenticated", async () => {
    vi.mocked(authenticate).mockImplementationOnce(async (_req, _res, next) => {
      next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
    });

    const response = await request(app)
      .patch("/user/me")
      .send({ fullName: "Updated Name" });

    expect(response.status).toBe(401);
  });

  it("should return 500 when database fails", async () => {
    vi.mocked(updateProfileService).mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .patch("/user/me")
      .send({ fullName: "Updated Name" });

    expect(response.status).toBe(500);
  });
});
