import { Router } from "express";
import { lockSeatController, payBookingController } from "../controllers/booking.controller.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/lock").post(verifyJwt , lockSeatController)
router.route("/pay").post(verifyJwt , payBookingController)

export default router