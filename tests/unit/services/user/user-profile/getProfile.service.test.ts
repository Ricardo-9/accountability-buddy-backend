
import { describe, expect, it, vi, beforeEach } from "vitest";
import { getProfileService } from "../../../../../src/modules/user/user-profile/services/getProfile.service";
import { fetchActiveProfile } from "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper";
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
 "../../../../../src/modules/user/user-profile/helpers/fetchActiveProfile.helper"
);

describe("getProfileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the active user profile", async () => {
    vi.mocked(fetchActiveProfile).mockResolvedValue(mockUserProfile);

    const result = await getProfileService("user-123");

    expect(result).toEqual(mockUserProfile);
    expect(fetchActiveProfile).toHaveBeenCalledWith("user-123");
  });

  it("should throw NOT_FOUND when user profile does not exist", async () => {

    const notFoundError = new AppError(
      "NOT_FOUND",
      "User profile not found",
      404,
    );
    vi.mocked(fetchActiveProfile).mockRejectedValue(notFoundError);

    await expect(getProfileService("user-999")).rejects.toMatchObject({
      code: "NOT_FOUND",
      statusCode: 404,
      message: "User profile not found",
    });

    expect(fetchActiveProfile).toHaveBeenCalledWith("user-999");
  });

});