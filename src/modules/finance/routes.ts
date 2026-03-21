import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createFinancialAccountSchema } from "./schemas/createfinancialaccount.schema.js";
import { createFinancialAccountController } from "./controllers/createfinancialaccount.controller.js";
import { adjustBalanceController } from "./controllers/adjustbalance.controller.js";
import { adjustBalanceSchema } from "./schemas/adjustbalance.schema.js";
import { requireArea } from "../../middlewares/requireArea.js";
import { AccountabilityArea } from "@prisma/client";
import { getStatementController } from "./controllers/getStatement.controller.js";
import { rateLimiter } from "../../middlewares/generalRateLimit.js";
import { getStatementSchema } from "./schemas/getStatement.schema.js";

const router = Router()

router.post(
    "/accounts", 
    authenticate, 
    requireArea(AccountabilityArea.FINANCES), 
    validateRequest(createFinancialAccountSchema),
    rateLimiter, 
    createFinancialAccountController
)

router.patch(
    "/accounts/balance", 
    authenticate, 
    requireArea(AccountabilityArea.FINANCES), 
    validateRequest(adjustBalanceSchema), 
    rateLimiter, 
    adjustBalanceController
)

router.get(
    "/accounts/statement",
    authenticate,
    requireArea(AccountabilityArea.FINANCES),
    validateRequest(getStatementSchema), 
    rateLimiter, 
    getStatementController
)

export { router as financialRoutes }