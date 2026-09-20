import { getDB } from "../db/index.js";

export const findCheckinByQRCode = (qrCode)=>
    {
        const db = getDB()

        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT
                        c.id AS checkin_id,
                        c.qr_code,
                        c.checked_in_at,
                        c.verified_by_organizer_id,
                        b.id AS booking_id,
                        b.quantity,
                        b.booking_status,
                        b.total_price,
                        b.attendee_id,
                        u.name AS attendee_name,
                        u.email AS attendee_email,
                        t.id  AS tier_id,
                        t.tier_name,
                        e.id AS event_id,
                        e.title AS event_title,
                        e.organizer_id
                    FROM checkins c
                    JOIN bookings b ON c.booking_id = b.id
                    JOIN ticket_tiers t ON b.tier_id = t.id
                    JOIN events e ON t.event_id = e.id
                    JOIN users u ON b.attendee_id = u.id
                    WHERE c.qr_code = ?
                `
                db.get(sql , [qrCode] , (err, row)=>
                    {
                        if(err) return reject(err)
                        resolve(row)
                    })
            })
    }

export const fincCheckinByQRCode = findCheckinByQRCode;

export const markTicketAsCheckedIn = (qrCode, organizerId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    UPDATE checkins
                        SET verified_by_organizer_id = ?,
                            checked_in_at = CURRENT_TIMESTAMP
                            WHERE qr_code = ?
                `
                db.run(sql , [organizerId , qrCode] , function(err)
                {
                    if(err) return reject(err)
                    resolve(this.changes > 0)
                })
                
            })
    }