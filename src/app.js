import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middleware/error.middleware.js"
import eventRouter from "./routes/event.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import checkinRouter from "./routes/checkIn.routes.js"
import analyticsRouter from "./routes/analytics.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const app = express();
//========== MIDDLEWARES ==================
app.use(cors({
    origin: (origin, callback) => callback(null, origin || true),
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(express.static(distPath))
app.use(cookieParser())
//========== MIDDLEWARES ==================

// ========== HEALTH & STATUS ROUTES =======
app.get(["/health", "/api/health"], (req , res) => {
    res.status(200).json({
        status: "OK",
        message: "Server is healthy and ready to accept requests",
        timestamp: new Date().toISOString()
    });
});
// ========== HEALTH & STATUS ROUTES =======

// ========== ROUTES ========================
// Support both /api/v1 and /v1 path patterns for local and Vercel serverless setups
app.use(["/api/v1/users", "/v1/users"], userRouter);
app.use(["/api/v1/events", "/v1/events"], eventRouter);
app.use(["/api/v1/bookings", "/v1/bookings"], bookingRouter);
app.use(["/api/v1/checkins", "/v1/checkins"], checkinRouter);
app.use(["/api/v1/analytics", "/v1/analytics"], analyticsRouter);
// ========== ROUTES ========================


//=========== SPA FALLBACK FOR FRONTEND CLIENT ROUTES ==========
app.use((req, res, next) => {
    if (req.method === "GET" && !req.originalUrl.startsWith("/api") && !req.originalUrl.startsWith("/v1")) {
        // If request is for an asset file with an extension that didn't match express.static, return 404
        if (/\.[a-zA-Z0-9]+$/.test(req.path)) {
            return res.status(404).send("File not found");
        }
        const indexPath = path.join(distPath, "index.html");
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
        return res.send("EventPulse is running. Frontend assets are compiling or please run 'npm run build'.");
    }
    next();
});

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