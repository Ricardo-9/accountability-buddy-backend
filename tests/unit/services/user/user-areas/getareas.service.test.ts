import { describe, it, vi, expect } from "vitest";
import { prisma } from "../../../../../src/lib/prisma";
import { getAreasService } from "../../../../../src/modules/user/areas/services/getareas.service";

vi.mock("../../../../../src/lib/prisma", () => ({
  prisma: {
    userArea: {
      findMany: vi.fn(),
    },
  },
}));

describe("Get user areas test", () => {
  it("should return a mapped array of areas", async () => {
    vi.mocked(prisma.userArea.findMany).mockResolvedValue([
      { area: "GYM" },
      { area: "FINANCES" },
    ] as any);

    const result = await getAreasService("userId");

    expect(result).toEqual(["GYM", "FINANCES"]);
  });

  it("should call findMany with the correct params", async () => {
    vi.mocked(prisma.userArea.findMany).mockResolvedValue([
      { area: "GYM" },
      { area: "FINANCES" },
    ] as any);

    await getAreasService("userId");

    expect(prisma.userArea.findMany).toHaveBeenCalledWith({
      where: { userId: "userId" },
      select: { area: true },
      orderBy: { area: "asc" },
    });
  });

  it("should return an empty array when the user has no areas", async () => {
    vi.mocked(prisma.userArea.findMany).mockResolvedValue([]);

    const result = await getAreasService("userId");

    expect(result).toEqual([]);
  });
});
