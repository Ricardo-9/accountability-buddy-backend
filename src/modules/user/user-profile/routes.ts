import { Router } from "express";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { updateProfileSchema } from "./schemas/updateProfile.schema.js";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { deleteProfileController } from "./controllers/deleteProfile.controller.js";
import { updateProfileController } from "./controllers/updateProfile.controller.js";
import { getProfileController } from "./controllers/getProfile.controller.js";

const router = Router();

router.get("/me", authenticate, getProfileController);

router.patch(
  "/me",
  validateRequest(updateProfileSchema),
  authenticate,
  updateProfileController
);

router.delete("/me", authenticate, deleteProfileController);

export { router as userProfileRoutes };
