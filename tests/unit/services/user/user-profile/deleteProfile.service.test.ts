import { describe, expect, it, vi, beforeEach } from "vitest";
import { deleteProfileService } from "../../../../../src/modules/user/user-profile/services/deleteProfile.service";
import { fetchActiveProfile } from "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper";
import { userProfileRepository } from "../../../../../src/modules/user/user-profile/repositories/userProfile.repository";
import { supabaseAdmin } from "../../../../../src/lib/supabaseAdmin";
import { AppError } from "../../../../../src/core/errors/AppError";

const mockUserProfile = {
  id: "user-123",
  fullName: "João Silva",
  birthDate: new Date("1990-01-15"),
  phone: "+5588999887766",
  status: "ACTIVE" as const,
};

vi.mock(
  "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper",
);

vi.mock(
  "../../../../../src/modules/user/user-profile/repositories/userProfile.repository",
);

vi.mock("../../../../../src/lib/supabaseAdmin", () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        updateUserById: vi.fn(),
      },
    },
  },
}));

describe("deleteProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully delete user profile", async () => {
    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);

    vi.mocked(userProfileRepository.softDelete).mockResolvedValue(
      mockUserProfile,
    );

    vi.mocked(
      supabaseAdmin.auth.admin.updateUserById,
    ).mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    const result = await deleteProfileService("user-123");

    expect(result).toEqual(mockUserProfile);
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
    });
  });

  it("should rollback when supabase ban fails", async () => {
    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);

    vi.mocked(userProfileRepository.softDelete).mockResolvedValue(
      mockUserProfile,
    );

    vi.mocked(
      supabaseAdmin.auth.admin.updateUserById,
    ).mockResolvedValue({
      data: { user: null },
      error: { message: "fail" },
    } as any);

    vi.mocked(userProfileRepository.reactivate).mockResolvedValue(
      mockUserProfile,
    );

    await expect(deleteProfileService("user-123")).rejects.toMatchObject({
      code: "DELETE_ERROR",
      statusCode: 502,
    });

    expect(userProfileRepository.reactivate).toHaveBeenCalledWith("user-123");
  });

  it("should rollback when unexpected error occurs", async () => {
    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);

    vi.mocked(userProfileRepository.softDelete).mockResolvedValue(
      mockUserProfile,
    );

    vi.mocked(
      supabaseAdmin.auth.admin.updateUserById,
    ).mockRejectedValue(new Error("unexpected"));

    vi.mocked(userProfileRepository.reactivate).mockResolvedValue(
      mockUserProfile,
    );

    await expect(deleteProfileService("user-123")).rejects.toThrow();

    expect(userProfileRepository.reactivate).toHaveBeenCalledWith("user-123");
  });
});