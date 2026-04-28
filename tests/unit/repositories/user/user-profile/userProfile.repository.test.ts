
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { userProfileRepository } from "../../../../../src/modules/user/user-profile/repositories/userProfile.repository";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    userProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("userProfileRepository", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("findById", () => {
    it("should call prisma.userProfile.findUnique with correct params", async () => {
      const mockProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(
        mockProfile as any,
      );

      await userProfileRepository.findById("user-123");

      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123", deletedAt: null, status: "ACTIVE" },
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should return the user profile with correct structure", async () => {
      const mockProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(
        mockProfile as any,
      );

      const result = await userProfileRepository.findById("user-123");

      expect(result).toEqual(mockProfile);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("fullName");
      expect(result).toHaveProperty("birthDate");
      expect(result).toHaveProperty("phone");
      expect(result).toHaveProperty("status");
    });

    it("should return null when user profile does not exist", async () => {
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

      const result = await userProfileRepository.findById("user-999");

      expect(result).toBeNull();
    });

    it("should return null when user profile is deleted", async () => {
      vi.mocked(prisma.userProfile.findUnique).mockResolvedValue(null);

      const result = await userProfileRepository.findById("deleted-user");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should call prisma.userProfile.update with correct params for full update", async () => {
      const updateData = {
        fullName: "João Pedro Silva",
        phone: "+5588988776655",
        birthDate: new Date("1990-01-15"),
      };

      const mockUpdatedProfile = {
        id: "user-123",
        fullName: "João Pedro Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588988776655",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockUpdatedProfile as any,
      );

      await userProfileRepository.update("user-123", updateData);

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: "user-123", deletedAt: null, status: "ACTIVE" },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should call prisma.userProfile.update with correct params for partial update (only fullName)", async () => {
      const updateData = {
        fullName: "João Pedro Silva",
      };

      const mockUpdatedProfile = {
        id: "user-123",
        fullName: "João Pedro Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockUpdatedProfile as any,
      );

      await userProfileRepository.update("user-123", updateData);

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: "user-123", deletedAt: null, status: "ACTIVE" },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should call prisma.userProfile.update with correct params for partial update (only phone)", async () => {
      const updateData = {
        phone: "+5588988776655",
      };

      const mockUpdatedProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588988776655",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockUpdatedProfile as any,
      );

      await userProfileRepository.update("user-123", updateData);

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: "user-123", deletedAt: null, status: "ACTIVE" },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should return the updated profile with correct structure", async () => {
      const updateData = {
        fullName: "João Pedro Silva",
      };

      const mockUpdatedProfile = {
        id: "user-123",
        fullName: "João Pedro Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockUpdatedProfile as any,
      );

      const result = await userProfileRepository.update("user-123", updateData);

      expect(result).toEqual(mockUpdatedProfile);
      expect(result?.fullName).toBe("João Pedro Silva");
    });
  });

  describe("softDelete", () => {
    it("should call prisma.userProfile.update with correct params", async () => {
      const mockDeletedProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "DELETED" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockDeletedProfile as any,
      );

      await userProfileRepository.softDelete("user-123");

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: "user-123", deletedAt: null, status: "ACTIVE" },
        data: { deletedAt: expect.any(Date), status: "DELETED" },
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should return the deleted profile", async () => {
      const mockDeletedProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "DELETED" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockDeletedProfile as any,
      );

      const result = await userProfileRepository.softDelete("user-123");

      expect(result).toEqual(mockDeletedProfile);
      expect(result?.status).toBe("DELETED");
    });

    it("should set deletedAt to current date", async () => {
      const mockDate = new Date("2024-01-15T10:00:00Z");
      vi.setSystemTime(mockDate);

      vi.mocked(prisma.userProfile.update).mockResolvedValue({} as any);

      await userProfileRepository.softDelete("user-123");

      const callArgs = vi.mocked(prisma.userProfile.update).mock.calls[0][0];
      expect(callArgs.data.deletedAt).toBeInstanceOf(Date);

      vi.useRealTimers();
    });
  });

  describe("reactivate", () => {
    it("should call prisma.userProfile.update with correct params", async () => {
      const mockReactivatedProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockReactivatedProfile as any,
      );

      await userProfileRepository.reactivate("user-123");

      expect(prisma.userProfile.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: { deletedAt: null, status: "ACTIVE" },
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          phone: true,
          status: true,
        },
      });
    });

    it("should return the reactivated profile", async () => {
      const mockReactivatedProfile = {
        id: "user-123",
        fullName: "João Silva",
        birthDate: new Date("1990-01-15"),
        phone: "+5588999887766",
        status: "ACTIVE" as const,
      };

      vi.mocked(prisma.userProfile.update).mockResolvedValue(
        mockReactivatedProfile as any,
      );

      const result = await userProfileRepository.reactivate("user-123");

      expect(result).toEqual(mockReactivatedProfile);
      expect(result?.status).toBe("ACTIVE");
    });
  });
});