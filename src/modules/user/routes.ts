import { Router } from "express";
import { signUpController } from "./auth/controllers/signUp.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { signupSchema } from "./auth/schemas/signUp.schema.js";
import { signinSchema } from "./auth/schemas/signIn.schema.js";
import { signInController } from "./auth/controllers/signIn.controller.js";
import { authLimiter } from "./auth/middlewares/authRateLimit.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { updateAreasController } from "./areas/controllers/updateAreas.controller.js";
import { updateAreasSchema } from "./areas/schemas/updateAreas.schema.js";
import { getAreasController } from "./areas/controllers/getAreas.controller.js";

const router = Router();

//AUTH
router.post(
  "/signup",
  authLimiter,
  validateRequest(signupSchema),
  signUpController,
);
router.post(
  "/signin",
  authLimiter,
  validateRequest(signinSchema),
  signInController,
);

//AREAS
router.get("/areas", authenticate, getAreasController);
router.put(
  "/areas",
  authenticate,
  validateRequest(updateAreasSchema),
  updateAreasController,
);

//export
export { router as userRoutes };
