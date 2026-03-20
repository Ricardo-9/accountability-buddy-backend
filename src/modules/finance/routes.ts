import { Router } from "express";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { createFinancialAccountSchema } from "./schemas/createfinancialaccount.schema.js";
import { createFinancialAccountController } from "./controllers/createfinancialaccount.controller.js";
import { adjustBalanceController } from "./controllers/adjustbalance.controller.js";
import { adjustBalanceSchema } from "./schemas/adjustbalance.schema.js";
import { requireArea } from "../../middlewares/requireArea.js";
import { AccountabilityArea } from "@prisma/client";
import rateLimit from "express-rate-limit";

const router = Router()

router.post(
    "/accounts", 
    authenticate, 
    requireArea(AccountabilityArea.FINANCES), 
    validateRequest(createFinancialAccountSchema), 
    rateLimit, 
    createFinancialAccountController
)

router.patch(
    "/accounts/balance", 
    authenticate, 
    requireArea(AccountabilityArea.FINANCES), 
    validateRequest(adjustBalanceSchema), 
    rateLimit, 
    adjustBalanceController
)

export { router as financialRoutes }