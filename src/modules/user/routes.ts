import { Router } from "express";
import { signupController } from "./auth/controllers/signup.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { signupSchema } from "./auth/schemas/signup.schema.js";
import { signinSchema } from "./auth/schemas/signin.schema.js";
import { signinController } from "./auth/controllers/signin.controller.js";
import { authLimiter } from "./auth/middlewares/authRateLimit.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { insertAreaController } from "./areas/controllers/insertarea.controller.js";
import { insertAreaSchema } from "./areas/schemas/insertarea.schema.js";

const router = Router();

//AUTH
router.post("/signup", validateRequest(signupSchema),authLimiter, signupController);
router.post("/signin", validateRequest(signinSchema),authLimiter, signinController);


//AREAS
router.post("/areas", authenticate, validateRequest(insertAreaSchema), insertAreaController);

export { router as userRoutes };
