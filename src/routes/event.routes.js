import { Router } from "express";
import { createEventController, getEventsController, getEventByIdController } from "../controllers/event.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/roles.middleware.js";

const router = Router()

// Public Route
router.route("/").get(getEventsController)
router.route("/:id").get(getEventByIdController)

// Protected Route
router.route("/").post(
    verifyJwt,
    verifyRole("ORGANIZER", "ADMIN"),
    createEventController
)

export default router