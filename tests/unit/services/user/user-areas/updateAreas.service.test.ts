import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateAreasService } from "../../../../../src/modules/user/areas/services/updateAreas.service";
import { userAreasRepository } from "../../../../../src/modules/user/areas/repositories/userAreas.repository";

vi.mock("../../../../../src/modules/user/areas/repositories/userAreas.repository")

describe("Update user areas test", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return an array with the provided arguments", async () => {
    vi.mocked(userAreasRepository.replaceUserAreas).mockResolvedValue([
      { area: "GYM" },
      { area: "FINANCES" }
    ]);

    const result = await updateAreasService("userId", ["GYM", "FINANCES"]);

    expect(result).toEqual(["GYM", "FINANCES"]);
  });
});
