import { Request, Response, NextFunction } from "express";
import { createGoalService } from "../services/createGoal.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function createGoalController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const {
    name,
    target,
    initialAmount,
    durationValue,
    durationUnit,
    style,
    categoryId,
  } = req.body;

  try {
    const result = await createGoalService(
      userId,
      name,
      target,
      initialAmount,
      durationValue,
      durationUnit,
      style,
      categoryId,
    );

    return successResponse(
      res,
      {
        goal: result.goal,
        newBalance: result.newBalance,
      },
      "Financial goal successfully created",
      201,
    );
  } catch (err) {
    next(err);
  }
}
