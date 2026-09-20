import dotenv from "dotenv"
import { connectDB } from "./db/index.js"
import { startExpirationJob } from "./cron/booking.cron.js"
import app from "./app.js"

dotenv.config({
    path:"./.env"
})

const PORT = process.env.PORT || 8000;

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