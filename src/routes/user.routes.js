import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { registerUser , loginUser , logoutUser , refreshAccessTokenController } from "../controllers/user.controller.js";
import { verifyRole } from "../middleware/roles.middleware.js";

const router = Router()


// Public routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/refresh").post(refreshAccessTokenController);

// Protected routes
router.route("/logout").get(verifyJwt, logoutUser)
router.route("/me").get(verifyJwt , (req , res)=>
    {
        return res.status(200).json({success:true , user: req.user})
    })
router.route("/admin-dashboard").get(
    verifyJwt,
    verifyRole("ADMIN"),
    (req , res)=>
        {
            return res.status(200).json(
                {
                    success:true,
                    message:"Welcome to ADMIN Dashboard"
                })
        }
)
export default router