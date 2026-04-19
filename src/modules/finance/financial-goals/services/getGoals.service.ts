import { prisma } from "../../../../lib/prisma.js";
import { ensureCategoryExists } from "../../shared/helpers/ensureCategoryExists.helper.js";
import { financialGoalsRepository } from "../repositories/financialGoals.repository.js";

export async function getGoalsService(
  userId: string,
  categoryId: string | null,
  limit = 10,
  cursor?: string,
) {
    await ensureCategoryExists(prisma, userId, categoryId)

    const goals = await financialGoalsRepository.getGoals(
      userId,
      categoryId,
      limit,
      cursor
    )

    const hasNextPage = goals.length > limit;
    const data = hasNextPage ? goals.slice(0, -1) : goals;

    const nextCursor = hasNextPage ? data.at(-1)?.id : null;

    return {
      data,
      nextCursor
    };
}
