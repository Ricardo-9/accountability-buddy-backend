import { Request, Response, NextFunction } from "express";
import { variableExpenseService } from "../services/variableExpenses.service.js";
import { successResponse } from "../../../shared/utils/apiResponse.js";
import { getVariableExpenseType } from "../schemas/getVariableExpenseById.schema.js";
import { updateVariableExpenseIdType } from "../schemas/updateVariableExpense.schema.js";

export const variableExpenseController = {
  async getVariableExpense(
    req: Request<getVariableExpenseType, any, any>,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user!.id;
    const { id } = req.params;

    try {
      const variableExpense = await variableExpenseService.getVariableExpense(
        userId,
        id,
      );

      return successResponse(res, variableExpense);
    } catch (err) {
      next(err);
    }
  },

  async getVariableExpenses(req: Request, res: Response, next: NextFunction) {
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

  async updateVariableExpense(
    req: Request<updateVariableExpenseIdType>,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user!.id;
    const data = req.body;
    const { id } = req.params;

    try {
      const updated = await variableExpenseService.updateVariableExpense(
        userId,
        id,
        data,
      );

      return successResponse(res, updated, "sucessfuly updated");
    } catch (err) {
      next(err);
    }
  },

  async deleteVariableExpense(
    req: Request<getVariableExpenseType>,
    res: Response,
    next: NextFunction,
  ) {
    const userId = req.user!.id;
    const { id } = req.params;
    try {
      await variableExpenseService.deleteExpense(userId, id);

      return successResponse(res, null, "sucessfuly deleted");
    } catch (err) {
      next(err);
    }
  },
};
