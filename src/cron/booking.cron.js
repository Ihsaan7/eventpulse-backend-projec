import cron from "node-cron";
import { getDB } from "../db/index.js";
import { expireBooking } from "../models/booking.model.js";

/**
 * Background task: Runs every minute to release expired seat locks.
 */
const startExpirationJob = () => {
    // Schedule to run every 1 minute
    cron.schedule("*/1 * * * *", async () => {
        const db = getDB();
        
        try {
            // 1. Find all bookings that are pending AND expired
            const expiredBookings = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, tier_id, quantity FROM bookings 
                     WHERE booking_status = 'PENDING_LOCK' 
                     AND seat_lock_expires_at < CURRENT_TIMESTAMP`,
                    [],
                    (err, rows) => {
                        if (err) return reject(err);
                        resolve(rows);
                    }
                );
            });

            // 2. Process each expired booking
            if (expiredBookings.length > 0) {
                console.log(`[CRON] Found ${expiredBookings.length} expired bookings. Releasing seats...`);
                
                for (const booking of expiredBookings) {
                    await expireBooking(booking.id, booking.tier_id, booking.quantity);
                }
                
                console.log("[CRON] Seats successfully released.");
            }
        } catch (error) {
            console.error("[CRON ERROR] Failed to release expired seats:", error.message);
        }
    });

    console.log("⚙️ Background Expiration Cron Job started (runs every minute).");
};

export { startExpirationJob };