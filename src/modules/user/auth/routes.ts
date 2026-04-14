import { Router } from "express";
import { authLimiter } from "./middlewares/authRateLimit.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { signUpController } from "./controllers/signUp.controller.js";
import { signInController } from "./controllers/signIn.controller.js";
import { signupSchema } from "./schemas/signUp.schema.js";
import { signinSchema } from "./schemas/signIn.schema.js";

const router = Router()

router.post("/signup", authLimiter, validateRequest(signupSchema), signUpController);
router.post("/signin", authLimiter, validateRequest(signinSchema), signInController);

export { router as userAuthRoutes }
