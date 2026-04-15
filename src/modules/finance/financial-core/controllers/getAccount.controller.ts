import { Request, Response, NextFunction } from "express";
import { financeAccountRepository } from "../repositories/financeAccount.repository.js";
import { successResponse } from "../../../../shared/utils/apiResponse.js";

export async function getAccountController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user!.id;

  try {
    const account = await financeAccountRepository.getAccount(userId);

    return successResponse(res, {
      accountId: account!.id,
      ownerId: account!.userId,
      balance: account!.balance,
      createdAt: account!.createdAt,
      updatedAt: account!.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}
