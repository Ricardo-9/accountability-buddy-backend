import { Request, Response, NextFunction } from "express";
import { getGoalsService } from "../services/getGoals.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { GetGoalsSchema } from "../schemas/getGoals.schema.js";

export async function getGoalsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { categoryId, limit, cursor } = req.query as unknown as GetGoalsSchema;

  try {
    const goals = await getGoalsService(userId, categoryId, limit, cursor);

    const hasNextPage = goals.length > limit;
    const data = hasNextPage ? goals.slice(0, -1) : goals;

    const nextCursor = hasNextPage ? data.at(-1)?.id : null;

    return successResponse(res, {
      goals: data,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}
