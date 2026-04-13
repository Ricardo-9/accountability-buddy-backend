import { Router } from "express";
import { authenticate } from "../../../middlewares/authMiddleware.js";
import { validateRequest } from "../../../middlewares/validateRequest.js";
import { getAreasController } from "./controllers/getAreas.controller.js";
import { updateAreasController } from "./controllers/updateAreas.controller.js";
import { updateAreasSchema } from "./schemas/updateAreas.schema.js";

const router = Router()

router.get("/areas", authenticate, getAreasController)
router.put("/areas", authenticate, validateRequest(updateAreasSchema), updateAreasController);

export { router as userAreasRoutes }