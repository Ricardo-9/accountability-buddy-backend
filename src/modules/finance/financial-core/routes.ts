import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
// import { requireArea } from "../../../middlewares/requireArea.js";
// import { requireFinancialAccount } from "../middlewares/requireFinancialAccount.js";
import { AccountabilityArea } from "@prisma/client";
import { createFinancialAccountController } from "./controllers/createFinancialAccount.controller.js";
import { getAccountController } from "./controllers/getAccount.controller.js";
import { adjustBalanceController } from "./controllers/adjustBalance.controller.js";
import { getStatementController } from "./controllers/getStatement.controller.js";
import { createFinancialAccountSchema } from "./schemas/createFinancialAccount.schema.js";
import { adjustBalanceSchema } from "./schemas/adjustBalance.schema.js";
import { getStatementSchema } from "./schemas/getStatement.schema.js";

const router = Router();

router.post(
  "/accounts",
  validateRequest(createFinancialAccountSchema),
  createFinancialAccountController,
);

router.get(
  "/accounts",
  authenticate,
  getAccountController,
);

router.patch(
  "/accounts/balance",
  authenticate,
  validateRequest(adjustBalanceSchema),
  adjustBalanceController,
);

router.get(
  "/accounts/statement",
  authenticate,
  validateRequest(getStatementSchema),
  getStatementController,
);

export { router as financialCoreRoutes };
