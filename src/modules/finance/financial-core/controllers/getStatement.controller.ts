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
    const statement = await getStatementService(
      userId,
      startDate,
      endDate,
      limit,
      cursor,
    );

    const hasNextPage = statement.length > limit;
    const data = hasNextPage ? statement.slice(0, -1) : statement;

    const nextCursor = hasNextPage ? data.at(-1)?.id : null;

    return successResponse(res, {
      statement: data,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
}
