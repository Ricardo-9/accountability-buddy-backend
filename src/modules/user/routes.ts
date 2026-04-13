import { Router } from "express";
import { signupController } from "./auth/controllers/signup.controller.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { signupSchema } from "./auth/schemas/signup.schema.js";
import { signinSchema } from "./auth/schemas/signin.schema.js";
import { signinController } from "./auth/controllers/signin.controller.js";
import { authLimiter } from "./auth/middlewares/authRateLimit.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { updateAreasController } from "./areas/controllers/updateareas.controller.js";
import { updateAreasSchema } from "./areas/schemas/updateareas.schema.js";
import { getAreasController } from "./areas/controllers/getareas.controller.js";

const router = Router();

//AUTH
router.post(
  "/signup",
  authLimiter,
  validateRequest(signupSchema),
  signupController,
);
router.post(
  "/signin",
  authLimiter,
  validateRequest(signinSchema),
  signinController,
);

//AREAS
router.get("/areas", authenticate, getAreasController);
router.put(
  "/areas",
  authenticate,
  validateRequest(updateAreasSchema),
  updateAreasController,
);

export { router as userRoutes };
