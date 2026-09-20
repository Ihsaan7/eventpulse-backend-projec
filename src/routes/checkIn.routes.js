
import { Router } from "express";
import { validateCheckinController } from "../controllers/checkIn.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/roles.middleware.js";

const router = Router()

router.route("/validate").post(
    verifyJwt,
    verifyRole("ORGANIZER", "ADMIN"),
    validateCheckinController
)

export default router