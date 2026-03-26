import { Request, Response, NextFunction } from "express";
import { variableExpenseService } from "../services/variableExpenses.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export const variableExpenseController = {
  async getVariableExpense(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const expenseId = req.body;

    try {
      const variableExpense = await variableExpenseService.getVariableExpense(
        userId,
        expenseId,
      );

      return successResponse(res, variableExpense);
    } catch (err) {
      next(err);
    }
  },

  async getVariableExpenes(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;

    try {
      const variableExpenses =
        await variableExpenseService.getVariableExpenses(userId);

      return successResponse(res, variableExpenses);
    } catch (err) {
      next(err);
    }
  },

  async createVariableExpense(req: Request, res: Response, next: NextFunction) {
    const userId = req.user!.id;
    const data = req.body;

    try {
      const variableExpense =
        await variableExpenseService.createVariableExpense(userId, data);

      return successResponse(
        res,
        variableExpense,
        "Variable Expense registered",
      );
    } catch (err) {
      next(err);
    }
  },
};
