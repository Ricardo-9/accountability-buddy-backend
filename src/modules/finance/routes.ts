import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createFinancialAccountSchema } from "./schemas/createfinancialaccount.schema.js";
import { createFinancialAccountController } from "./controllers/createfinancialaccount.controller.js";
import { adjustBalanceController } from "./controllers/adjustbalance.controller.js";
import { adjustBalanceSchema } from "./schemas/adjustbalance.schema.js";

const router = Router()

router.post("/accounts", authenticate, validateRequest(createFinancialAccountSchema), createFinancialAccountController)
router.patch("/accounts/balance", authenticate, validateRequest(adjustBalanceSchema), adjustBalanceController)

export { router as financialRoutes }