
import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteProfileService } from "../../../../../src/modules/user/user-profile/services/deleteProfile.service";
import { fetchActiveProfile } from "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper";
import { userProfileRepository } from "../../../../../src/modules/user/user-profile/repositories/userProfile.repository";
import { AppError } from "../../../../../src/core/errors/AppError";

const mockUserProfile = {
  id: "user-123",
  fullName: "João Silva",
  email: "joao@email.com",
  phone: "+5588999887766",
  birthDate: new Date("1990-01-15"),
  status: "ACTIVE" as const,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

vi.mock(
 "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper",
);

vi.mock(
 "../../../../../src/modules/user/user-profile/repositories/userProfile.repository",
);

describe("deleteProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete user profile", async () => {
    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);

    await deleteProfileService("user-123");

    expect(fetchActiveProfile).toHaveBeenCalledWith("user-123");
    expect(userProfileRepository.delete).toHaveBeenCalledWith("user-123");
  });

  it("should throw NOT_FOUND when user profile does not exist", async () => {
    const notFoundError = new AppError(
      "NOT_FOUND",
      "User profile not found",
      404,
    );

    vi.mocked(fetchActiveProfile).mockRejectedValue(notFoundError);

    await expect(deleteProfileService("user-999")).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "User profile not found",
    });

  });

  it("should throw DELETE_ERROR when Supabase ban fails", async () => {
    const deleteError = new AppError(
      "DELETE_ERROR",
      "Failed to deactivate account",
      502,
    );

    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);
    vi.mocked(userProfileRepository.delete).mockRejectedValue(deleteError);

    await expect(deleteProfileService("user-123")).rejects.toMatchObject({
      code: "DELETE_ERROR",
      statusCode: 502,
      message: "Failed to deactivate account",
    });

    expect(fetchActiveProfile).toHaveBeenCalledWith("user-123");
    expect(userProfileRepository.delete).toHaveBeenCalledWith("user-123");
  });
});