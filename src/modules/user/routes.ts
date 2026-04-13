import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { authenticate } from "../../middlewares/authMiddleware.js";
import { updateAreasController } from "./areas/controllers/updateareas.controller.js";
import { updateAreasSchema } from "./areas/schemas/updateareas.schema.js";
import { getAreasController } from "./areas/controllers/getareas.controller.js";

const router = Router()

//AREAS
router.get("/areas", authenticate, getAreasController)
router.put("/areas", authenticate, validateRequest(updateAreasSchema), updateAreasController);

export { router as userRoutes };
