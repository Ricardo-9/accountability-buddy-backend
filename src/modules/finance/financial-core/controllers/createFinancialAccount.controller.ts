import { Request, Response, NextFunction } from "express";
import { createFinancialAccountService } from "../services/createFinancialAccount.service.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function createFinancialAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;
  const { balance } = req.body;

  try {
    const account = await createFinancialAccountService(userId, balance);

    return successResponse(
      res,
      {
        accountId: account.id,
        ownerId: account.userId,
        balance: account.balance,
        createdAt: account.createdAt,
      },
      "Account successfully created",
      201,
    );
  } catch (err) {
    next(err);
  }
}
