import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middleware/error.middleware.js"
import eventRouter from "./routes/event.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import checkinRouter from "./routes/checkIn.routes.js"
import analyticsRouter from "./routes/analytics.routes.js";

const app = express();
//========== MIDDLEWARES ==================
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())
//========== MIDDLEWARES ==================

// ========== HEALTH & STATUS ROUTES =======
app.get("/" , (req , res)=>
    {
        res.send("EventPulse is running")
    })
app.get("/health", (req , res)=>
    {
        res.status(200).json(
            {
                status:"OK",
                message:"Server is healthy and ready to accept requests",
                timestamp:new Date().toISOString()
            })
    })
// ========== HEALTH & STATUS ROUTES =======

// ========== ROUTES ========================
app.use("/api/v1/users" , userRouter)


app.use("/api/v1/events", eventRouter)


app.use("/api/v1/bookings", bookingRouter)


app.use("/api/v1/checkins", checkinRouter);


app.use("/api/v1/analytics", analyticsRouter);
// ========== ROUTES ========================


//=========== CATCH-ALL 404 HANDLER ==========
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        statusCode: 404
    });
});

// ========== GLOBAL ERROR HANDLER =========
app.use(errorHandler)
// ========== GLOBAL ERROR HANDLER =========
export default app;