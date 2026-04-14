import { Request, Response, NextFunction } from "express";
import { goalDepositService } from "../services/goalDeposit.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function goalDepositController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { id } = req.params;
  const { amount } = req.body;

  try {
    const deposit = await goalDepositService(
      id as unknown as string,
      userId,
      amount,
    );

    return successResponse(res, deposit);
  } catch (err) {
    next(err);
  }
}
