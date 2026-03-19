import { Router } from "express";
import { userProfileControllers } from "./controllers/userProfile.controller.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { updateProfileSchema } from "./schemas/updateProfile.schema.js";
import { authenticate } from "../../../middlewares/authMiddleware.js";

const router = Router();

router.get("/me", authenticate, userProfileControllers.getProfile);

router.patch(
  "/me",
  validateRequest(updateProfileSchema),
  authenticate,
  userProfileControllers.updateProfile,
);

router.delete("/me", authenticate, userProfileControllers.deleteProfile);

export { router as userProfileRoutes };
