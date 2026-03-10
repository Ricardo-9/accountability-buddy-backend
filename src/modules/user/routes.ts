import { Router } from "express";
import { signupController } from "./controllers/signup.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { signupSchema } from "./schemas/signup.schema.js";

const router = Router()

router.post("/signup", validateRequest(signupSchema), signupController)

export { router as userRoutes }