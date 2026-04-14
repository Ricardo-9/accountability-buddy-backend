import { describe, it, vi, expect } from "vitest";
import { getAreasService } from "../../../../../src/modules/user/areas/services/getAreas.service";
import { userAreasRepository } from "../../../../../src/modules/user/areas/repositories/userAreas.repository";

vi.mock("../../../../../src/modules/user/areas/repositories/userAreas.repository")
describe("Get user areas test", () => {
  it("should return a mapped array of areas", async () => {
    vi.mocked(userAreasRepository.findAreas).mockResolvedValue([
      { area: "GYM" },
      { area: "FINANCES" },
    ] as any);

    const result = await getAreasService("userId");

    expect(result).toEqual(["GYM", "FINANCES"]);
  });
  
  it("should return an empty array when the user has no areas", async () => {
    vi.mocked(userAreasRepository.findAreas).mockResolvedValue([]);

    const result = await getAreasService("userId");

    expect(result).toEqual([]);
  });
});
