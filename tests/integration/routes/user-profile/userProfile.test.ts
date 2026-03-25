import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import app from "../../../../src/app.js";
import { userProfileServices } from "../../../../src/modules/user/user-profile/services/userProfile.service.js";
import { ProfileStatus } from "@prisma/client";
import { AppError } from "../../../../src/core/errors/AppError.js";
import { authenticate } from "../../../../src/middlewares/authMiddleware.js";

const fakeProfile = {
  id: "user-123",
  fullName: "name",
  birthDate: new Date("2000-01-01"),
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  status: "ACTIVE" as ProfileStatus,
};

const fakeUpdatedProfile = {
  id: "user-123",
  fullName: "New Name",
  birthDate: new Date("2000-01-01"),
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  status: "ACTIVE" as ProfileStatus,
};

vi.mock("../../../../src/middlewares/authMiddleware.ts", () => ({
  authenticate: vi.fn((req, _res, next) => {
    req.user = { id: "user-123" };
    next();
  }),
}));

vi.mock(
  "../../../../src/modules/user/user-profile/services/userProfile.service.js",
  () => ({
    userProfileServices: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      deleteProfile: vi.fn(),
    },
  }),
);

describe("user profiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("get profile", () => {
    it("should return 200 and profile when user exists", async () => {
      vi.mocked(userProfileServices.getProfile).mockResolvedValue(fakeProfile);

      const response = await request(app).get("/user/me");

      expect(response.statusCode).toBe(200);
      expect(response.body.data.id).toBe("user-123");
      expect(response.body.error).toBeUndefined();
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(
        async (req: any, _res: any, next) => {
          next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
        },
      );

      const response = await request(app).get("/finance/categories");

      expect(response.status).toBe(401);
    });

    it("should return 404 when profile is not found", async () => {
      vi.mocked(userProfileServices.getProfile).mockRejectedValue(
        new AppError("NOT_FOUND", "Profile not found", 404),
      );

      const response = await request(app).get("/user/me");

      expect(response.statusCode).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(userProfileServices.getProfile).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).get("/user/me");

      expect(response.status).toBe(500);
    });
  });

  describe("update profile", () => {
    it("should return 200 and updated profile", async () => {
      const updated = { ...fakeProfile, fullName: "New Name" };
      vi.mocked(userProfileServices.updateProfile).mockResolvedValue(updated);

      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: "New Name" });

      expect(response.statusCode).toBe(200);
      expect(response.body.data.fullName).toBe("New Name");
      expect(response.body.error).toBeUndefined();
    });

    it("should return 400 when body fails validation", async () => {
      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: 123 });

      expect(response.statusCode).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(
        async (req: any, _res: any, next) => {
          next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
        },
      );

      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: "New Name" });

      expect(response.status).toBe(401);
    });

    it("should return 404 when profile is not found", async () => {
      vi.mocked(userProfileServices.updateProfile).mockRejectedValue(
        new AppError("NOT_FOUND", "Profile not found", 404),
      );
      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: "New Name" });

      expect(response.statusCode).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(userProfileServices.updateProfile).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app)
        .patch("/user/me")
        .send({ fullName: "New Name" });

      expect(response.status).toBe(500);
    });
  });

  describe("delete profile", () => {
    it("should return 200 when profile is deleted", async () => {
      const deleted = {
        ...fakeProfile,
        deletedAt: new Date(),
        status: "DELETED" as ProfileStatus,
      };
      vi.mocked(userProfileServices.deleteProfile).mockResolvedValue();

      const response = await request(app).delete("/user/me");

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Profile deleted");
      expect(response.body.error).toBeUndefined();
    });

    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(authenticate).mockImplementationOnce(
        async (req: any, _res: any, next) => {
          next(new AppError("UNAUTHORIZED", "Invalid or expired token", 401));
        },
      );

      const response = await request(app).delete("/user/me");

      expect(response.status).toBe(401);
    });

    it("should return 404 when profile is not found", async () => {
      vi.mocked(userProfileServices.deleteProfile).mockRejectedValue(
        new AppError("NOT_FOUND", "Profile not found", 404),
      );
      const response = await request(app).delete("/user/me");

      expect(response.statusCode).toBe(404);
      expect(response.body.error.code).toBe("NOT_FOUND");
    });

    it("should return 500 when database fails", async () => {
      vi.mocked(userProfileServices.deleteProfile).mockRejectedValue(
        new Error("DB error"),
      );

      const response = await request(app).delete("/user/me");

      expect(response.status).toBe(500);
    });
  });
});
