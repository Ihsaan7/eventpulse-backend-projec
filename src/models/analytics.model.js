import { getDB } from "../db/index.js";

export const getEventSalesSummary = (eventId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    SELECT
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PAID' THEN b.total_price ELSE 0 END), 0)
                        AS total_revenue,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PAID' THEN b.quantity ELSE 0 END), 0)
                        AS tickets_sold,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PAID' THEN 1 ELSE 0), 0)
                        AS paid_bookings,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PENDING_LOCK' THEN b.quantity ELSE 0 END) , 0)
                        AS seats_locked,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'EXPIRED' THEN b.quantity ELSE 0 END), 0)
                        AS expired_quantity
                    FROM ticket_tiers t
                    LEFT JOIN bookings b on b.tier_id = t.id
                    WHERE t.event_id = ?
                `
                db.get(sql , [eventId], (err , row)=>
                    {
                        if(err) return reject(err)
                        resolve(row || {})
                    })
            })
    }

export const getEventSales = getEventSalesSummary;

export const getEventRemainingSeats = (eventId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT COALESCE(SUM(available_seats),0) AS remaining_seats
                        FROM ticket_tiers
                            WHERE event_id = ?
                `
                db.get(sql , [eventId] , (err , row)=>
                    {
                        if(err) return reject(err)
                        resolve(row?.remaining_seats || 0)
                    })
            })
    }

export const getEventRemainSeats = getEventRemainingSeats;

export const getEventTierBreakdown = (eventId)=>
    {
        const db = getDB()

        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT
                        t.id AS tier_id,
                        t.tier_name,
                        t.price,
                        t.available_seats,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PAID' THEN b.quantity ELSE 0 END), 0) AS tickets_sold,
                        COALESCE(SUM(CASE WHEN b.booking_status = 'PAID' THEN b.total_price ELSE 0 END), 0) AS revenue
                        FROM ticket_tiers t
                        LEFT JOIN bookings b ON b.tier_id = t.id
                        WHERE t.event_id = ?
                        GROUP BY t.id
                        ORDER BY t.price DESC
                `
                db.all(sql, [eventId], (err, rows)=>
                    {
                        if(err) return reject(err)
                        resolve(rows || [])
                    })
            })
    }

export const getEventCheckinStats = (eventId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT COUNT(*) AS checked_in_count
                    FROM checkins c
                    JOIN bookings b ON c.booking_id = b.id
                    JOIN ticket_tiers t ON b.tier_id = t.id
                    WHERE t.event_id = ?
                        AND b.booking_status = 'PAID'
                        AND c.checked_in_at IS NOT NULL
                `

                db.get(sql, [eventId], (err , row)=>
                    {
                        if(err) return reject(err)
                        resolve(row?.checked_in_count || 0)
                    })
            })
    }

export const getEventsCheckinStats = getEventCheckinStats;

export const getOrganizerOverview = (organizerId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT
                        e.id AS event_id,
                        e.title,
                        e.status,
                        e.start_time,
                        e.venue,
                    COALESCE((
                        SELECT SUM(available_seats)
                        FROM ticket_tiers
                        WHERE event_id = e.id
                    ), 0) AS remaining_seats,
                    COALESCE((
                        SELECT SUM(b.total_price)
                        FROM bookings b
                        JOIN ticket_tiers t ON b.tier_id = t.id
                        WHERE t.event_id = e.id
                            AND b.booking_status = 'PAID'
                    ), 0) AS total_revenue,
                    COALESCE((
                        SELECT SUM(b.quantity)
                        FROM bookings b
                        JOIN ticket_tiers t ON b.tier_id = t.id
                        WHERE t.event_id = e.id
                            AND b.booking_status = 'PAID'
                    ), 0) AS tickets_sold
                FROM events e
                WHERE e.organizer_id = ?
                ORDER BY e.start_time DESC
                `
                db.all(sql ,[organizerId], (err, rows)=>
                    {
                        if(err) return reject(err)
                        resolve(rows || [])
                    })
            })
    }

export const getOrganizedOverview = getOrganizerOverview;