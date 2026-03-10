import { Router } from "express";
import { signupController } from "./controllers/signup.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { signupSchema } from "./schemas/signup.schema.js";
import { signinSchema } from "./schemas/signin.schema.js";
import { signinController } from "./controllers/signin.controller.js";

const router = Router()

router.post("/signup", validateRequest(signupSchema), signupController)
router.post("/signin", validateRequest(signinSchema), signinController)

export { router as userRoutes }