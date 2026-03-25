import { Request, Response, NextFunction } from "express";
import { variableExpenseService } from "../services/variableExpenses.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";

export const variableExpenseController = {
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
