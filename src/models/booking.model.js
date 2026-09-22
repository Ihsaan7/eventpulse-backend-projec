import { getDB } from "../db/index.js"

export const createPendingBooking = (userIdOrObj, tierIdParam, quantityParam) => {
    let userId, tierId, quantity;
    if (typeof userIdOrObj === "object" && userIdOrObj !== null) {
        userId = userIdOrObj.userId || userIdOrObj.attendee_id;
        tierId = userIdOrObj.tierId || userIdOrObj.tier_id;
        quantity = userIdOrObj.quantity;
    } else {
        userId = userIdOrObj;
        tierId = tierIdParam;
        quantity = quantityParam;
    }

    const db = getDB();

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION;", (err) => {
                if (err) return reject(err);
            });
            const checkSQL = `
                SELECT available_seats, price
                FROM ticket_tiers
                WHERE id = ?
            `;
            db.get(checkSQL, [tierId], (err, tier) => {
                if (err) return db.run("ROLLBACK;", () => reject(err));
                
                if (!tier) {
                    return db.run("ROLLBACK;", () => {
                        reject(new Error("Ticket tier not found!"));
                    });
                }
                if (tier.available_seats < quantity) {
                    return db.run("ROLLBACK;", () => {
                        reject(new Error("Not enough available seats!"));
                    });
                }
                const calculatedTotal = tier.price * quantity;

                const updateSeatsSQL = `
                    UPDATE ticket_tiers
                    SET available_seats = available_seats - ?
                    WHERE id = ?
                `;
                db.run(updateSeatsSQL, [quantity, tierId], function(err) {
                    if (err) return db.run("ROLLBACK;", () => reject(err));
                    
                    const expiresAt = new Date(
                        Date.now() + 10 * 60 * 1000
                    ).toISOString();
                
                    const insertBookingSQL = `
                        INSERT INTO bookings(
                            attendee_id, tier_id, quantity, total_price, booking_status,
                            seat_lock_expires_at
                        )
                        VALUES (?, ?, ?, ?, "PENDING_LOCK", ?)
                    `;
                    db.run(
                        insertBookingSQL,
                        [userId, tierId, quantity, calculatedTotal, expiresAt],
                        function(err) {
                            if (err) return db.run("ROLLBACK;", () => reject(err));
                            
                            db.run("COMMIT;", (commitErr) => {
                                if (commitErr) return db.run("ROLLBACK;", () => reject(commitErr));
                                resolve({
                                    id: this.lastID,
                                    attendee_id: userId,
                                    tier_id: tierId,
                                    quantity,
                                    total_price: calculatedTotal,
                                    booking_status: "PENDING_LOCK",
                                    seat_lock_expires_at: expiresAt,
                                });
                            });
                        }
                    );
                });
            });
        });
    });
};

export const expireBooking = (bookingIdOrObj, tierIdParam, quantityParam) => {
    let bookingId, tierId, quantity;
    if (typeof bookingIdOrObj === "object" && bookingIdOrObj !== null) {
        bookingId = bookingIdOrObj.bookingId;
        tierId = bookingIdOrObj.tierId;
        quantity = bookingIdOrObj.quantity;
    } else {
        bookingId = bookingIdOrObj;
        tierId = tierIdParam;
        quantity = quantityParam;
    }

    const db = getDB()
    return new Promise((resolve , reject)=>
        {
            db.serialize(()=>
                {
                    db.run("BEGIN TRANSACTION;", (err)=>
                        {
                            if(err) return reject(err)
                        })
                    const releaseSeatsSQL=`
                        UPDATE ticket_tiers
                            SET available_seats = available_seats + ?
                                WHERE id = ?
                    `
                    db.run(releaseSeatsSQL , [quantity , tierId] , (err)=>
                        {
                            if(err) return db.run("ROLLBACK;", (err)=> reject(err))
                            
                            db.run(" UPDATE bookings SET booking_status = 'EXPIRED' WHERE id = ? " ,
                                    [bookingId], (err)=>
                                        {
                                            if(err) return db.run("ROLLBACK;", ()=> reject(err))
                                            db.run("COMMIT;", (err)=>
                                            {
                                                if(err) return db.run("ROLLBACK;",()=> reject(err))
                                                resolve(true)
                                            })
                                        }
                            )
                            
                        })
                })
        })
}

export const expiresBooking = expireBooking;

export const markBookingPaid = (bookingId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                db.run(
                    "UPDATE bookings SET booking_status = 'PAID' WHERE id = ?",
                    [bookingId], function(err)
                    {
                        if(err) return reject(err)
                        resolve(this.changes > 0)
                    }
                )
            })
    }

export const findBookingById = (bookingId)=>
    {
        const db = getDB();
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    SELECT * FROM bookings
                        WHERE id = ?
                `
                db.get(sql , [bookingId] , (err, row)=>
                    {
                        if(err) return reject(err)
                        resolve(row)
                    })
            })
    }