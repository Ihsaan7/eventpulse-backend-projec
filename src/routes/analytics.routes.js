import { Router } from "express";
import {
    getEventAnalyticsController,
    getOrganizerOverviewController
} from "../controllers/analytics.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/roles.middleware.js";

const router = Router();

router.use(verifyJwt, verifyRole("ORGANIZER", "ADMIN"));

router.route("/me").get(getOrganizerOverviewController);
router.route("/events/:eventId").get(getEventAnalyticsController);

export default router;