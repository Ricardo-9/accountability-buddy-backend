import { Router } from "express";
import { signupController } from "./controllers/signup.controller.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { signupSchema } from "./schemas/signup.schema.js";
import { signinSchema } from "./schemas/signin.schema.js";
import { signinController } from "./controllers/signin.controller.js";
import { authLimiter } from "./middlewares/authRateLimit.js";

const router = Router();

router.post("/signup", validateRequest(signupSchema),authLimiter, signupController);
router.post("/signin", validateRequest(signinSchema),authLimiter, signinController);

export { router as authRoutes };
