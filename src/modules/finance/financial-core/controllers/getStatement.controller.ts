import { Request, Response, NextFunction } from "express";
import { getStatementService } from "../services/getStatement.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";
import { GetStatementSchema } from "../schemas/getStatement.schema.js";

export async function getStatementController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { startDate, endDate, limit, cursor } =
    req.query as unknown as GetStatementSchema;

  try {
    const {statement, nextCursor} = await getStatementService(
      userId,
      limit,
      startDate,
      endDate,
      cursor,
    );

    return successResponse(res, {
      statement,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}
