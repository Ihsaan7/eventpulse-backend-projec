import dotenv from "dotenv"
import fs from "fs"
import path from "path"
import { execSync } from "child_process"
import { connectDB } from "./db/index.js"
import { startExpirationJob } from "./cron/booking.cron.js"
import app from "./app.js"

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 3000;

// Ensure frontend assets are compiled if missing
const distIndex = path.resolve(process.cwd(), "dist/index.html");
if (!fs.existsSync(distIndex)) {
    try {
        console.log("⚙️ Frontend build not found. Compiling Vite assets...");
        execSync("npx vite build", { stdio: "inherit" });
        console.log("✅ Frontend compilation complete!");
    } catch (buildErr) {
        console.warn("⚠️ Warning: Failed auto-building frontend assets:", buildErr.message);
    }
}

connectDB()
    .then(()=>
        {
            startExpirationJob()
            app.listen(PORT, () => {
                console.log(`⚙️ Server is running at port : ${PORT}`)
            })
        })
    .catch((err)=>
        {
            console.log("❌ SQLite DB connection failed !!! ", err)
        })