import { describe, expect, it, vi, beforeEach } from "vitest";
import { updateProfileService } from "../../../../../src/modules/user/user-profile/services/updateProfile.service";
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

const mockUpdatedProfile = {
  ...mockUserProfile,
  fullName: "João Pedro Silva",
  phone: "+5588988776655",
  updatedAt: new Date(),
};

vi.mock(
  "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper",
);

vi.mock(
  "../../../../../src/modules/user/user-profile/repositories/userProfile.repository",
);

describe("updateProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update user profile with all fields", async () => {
    const updateData = {
      fullName: "João Pedro Silva",
      phone: "+5588988776655",
      birthDate: new Date("1990-01-15"),
    };

    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);
    vi.mocked(userProfileRepository.update).mockResolvedValue(
      mockUpdatedProfile,
    );

    const result = await updateProfileService("user-123", updateData);

    expect(result).toEqual(mockUpdatedProfile);
    expect(fetchActiveProfile).toHaveBeenCalledWith("user-123");
    expect(userProfileRepository.update).toHaveBeenCalledWith(
      "user-123",
      updateData,
    );
  });

  it("should update user profile with partial data (only fullName)", async () => {
    const updateData = {
      fullName: "João Pedro Silva",
    };

    const partiallyUpdated = {
      ...mockUserProfile,
      fullName: "João Pedro Silva",
    };

    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);
    vi.mocked(userProfileRepository.update).mockResolvedValue(partiallyUpdated);

    const result = await updateProfileService("user-123", updateData);

    expect(result).toEqual(partiallyUpdated);
    expect(userProfileRepository.update).toHaveBeenCalledWith(
      "user-123",
      updateData,
    );
  });

  it("should update user profile with partial data (only phone)", async () => {
    const updateData = {
      phone: "+5588988776655",
    };

    const partiallyUpdated = {
      ...mockUserProfile,
      phone: "+5588988776655",
    };

    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);
    vi.mocked(userProfileRepository.update).mockResolvedValue(partiallyUpdated);

    const result = await updateProfileService("user-123", updateData);

    expect(result).toEqual(partiallyUpdated);
  });

  it("should throw NOT_FOUND when user profile does not exist", async () => {
    const updateData = { fullName: "João Pedro Silva" };
    const notFoundError = new AppError(
      "NOT_FOUND",
      "User profile not found",
      404,
    );

    vi.mocked(fetchActiveProfile).mockRejectedValue(notFoundError);

    await expect(
      updateProfileService("user-999", updateData),
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "User profile not found",
    });
  });
});
