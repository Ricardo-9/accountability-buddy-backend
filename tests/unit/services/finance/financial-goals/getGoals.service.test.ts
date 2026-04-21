import { describe, it, expect, beforeEach, vi } from "vitest";
import { financialGoalsRepository } from "../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository";
import { ensureCategoryExists } from "../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper";
import { getGoalsService } from "../../../../../src/modules/finance/financial-goals/services/getGoals.service";
import { AppError } from "../../../../../src/core/errors/AppError";

vi.mock("../../../../../src/modules/finance/financial-goals/repositories/financialGoals.repository")
vi.mock("../../../../../src/modules/finance/shared/helpers/ensureCategoryExists.helper")

const mockGoals = [
  { id: "id1" },
  { id: "id2" },
  { id: "id3" },
  { id: "id4" }
];

const userId = "07c7db0b-8c87-4bc6-853b-1327afa6b262";

describe("Get financial goals service test", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(ensureCategoryExists).mockResolvedValue(undefined)
  });

  it("should return all goals when result size is less than limit", async () => {
    vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(mockGoals as any);

    const result = await getGoalsService(userId, "categoryId");

    expect(ensureCategoryExists).toHaveBeenCalledWith(
      expect.anything(),
      userId,
      "categoryId"
    )
    expect(result).toMatchObject({
      data: mockGoals,
      nextCursor: null
    })
  });

  it("should remove extra item and return nextCursor", async () => {
    vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(
      mockGoals as any
    );

    const result = await getGoalsService(userId, null, 3);

    expect(result).toEqual({
      data: [
        { id: "id1" },
        { id: "id2" },
        { id: "id3" }
      ],
      nextCursor: "id3"
    });
  });

  it("should call repository with correct params", async () => {
    vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(mockGoals as any)

    await getGoalsService(userId, "categoryId", 3, "cursor")

    expect(financialGoalsRepository.getGoals).toHaveBeenCalledWith(
      userId,
      "categoryId",
      3,
      "cursor"
    )
  })

  it("should use default limit when no provided", async () => {
    vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue(mockGoals as any)

    await getGoalsService(userId, null)

    expect(financialGoalsRepository.getGoals).toHaveBeenCalledWith(
      userId,
      null,
      10,
      undefined
    )
  })

  it("should throw when categoryId is invalid", async () => {
    vi.mocked(ensureCategoryExists).mockRejectedValue(new AppError("NOT_FOUND", "Category not found", 404))

    await expect(getGoalsService(userId, null)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "Category not found",
      statusCode: 404
    })
  })

  it("should return an empty array when no goals found", async () => {
    vi.mocked(financialGoalsRepository.getGoals).mockResolvedValue([]);

    const result = await getGoalsService(userId, null);

    expect(result).toMatchObject({
      data: [],
      nextCursor: null
    })
  });
});
