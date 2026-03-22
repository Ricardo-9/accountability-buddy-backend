import { describe, it, expect, vi, beforeEach } from "vitest";
import { userProfileServices } from "../../../../../src/modules/user/user-profile/services/userProfile.service";
import { userProfileRepository } from "../../../../../src/modules/user/user-profile/repositories/userProfile.repository";
import { ProfileStatus } from "@prisma/client";

vi.mock(
  "../../../../../src/modules/user/user-profile/repositories/userProfile.repository",
);

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

describe("profileServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GetProfile", () => {
    it("should return profile when it exists", async () => {
      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(
        fakeProfile,
      );

      const result = await userProfileServices.getProfile("user-123");

      expect(result).toEqual(fakeProfile);
    });

    it("should throw NOT_FOUND when profile does not exist", async () => {
      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(null);

      await expect(
        userProfileServices.getProfile("user-123"),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Profile not found",
        statusCode: 404,
      });
    });
  });

  describe("updateProfile", () => {
    it("should update profile when it exists", async () => {
      const updated = { ...fakeProfile, fullName: "New name" };

      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(
        fakeProfile,
      );
      vi.spyOn(userProfileRepository, "update").mockResolvedValue(updated);

      const result = await userProfileServices.updateProfile("user-123", {
        fullName: "New name",
      });

      expect(userProfileRepository.update).toHaveBeenCalledWith("user-123", {
        fullName: "New name",
      });
      expect(result.fullName).toEqual("New name");
    });

    it("should throw NOT_FOUND when profile does not exist", async () => {
      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(null);

      await expect( 
        userProfileServices.updateProfile("user-123", { fullName: "New " }),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Profile not found",
        statusCode: 404,
      });
    });
  });

  describe("deleteProfile", () => {
    it("should delete the profile when profile exist", async () => {
      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(
        fakeProfile,
      );
      vi.spyOn(userProfileRepository, "delete").mockResolvedValue();

      const profile = await userProfileServices.deleteProfile("user-123");

      expect(userProfileRepository.delete).toHaveBeenCalledWith("user-123");
    });

    it("should throw NOT_FOUND when profile does not exist ", async () => {
      vi.spyOn(userProfileRepository, "findById").mockResolvedValue(null);

      await expect(
        userProfileServices.deleteProfile("user-123"),
      ).rejects.toMatchObject({
        code: "NOT_FOUND",
        message: "Profile not found",
        statusCode: 404,
      });
    });
  });
});
