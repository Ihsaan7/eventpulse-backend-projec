import {getDB} from "../db/index.js"

export const createTicket = (eventId, tiers) => {
    const db = getDB()
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO ticket_tiers (event_id, tier_name, price, available_seats)
            VALUES (?, ?, ?, ?)
        `
        const promises = tiers.map(tier => {
            return new Promise((res, rej) => {
                const params = [eventId, tier.tier_name, tier.price, tier.available_seats];
                db.run(sql, params, function (err) {
                    if (err) return rej(err)
                    res({ id: this.lastID, ...tier })
                })
            })
        })
        Promise.all(promises)
            .then(createdTiers => resolve(createdTiers))
            .catch(err => reject(err))
    })
}

export const getTiersByEventId = (eventId)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    SELECT * FROM ticket_tiers
                        WHERE event_id = ?
                `
                db.all(sql , [eventId] , (err , rows)=>
                    {
                        if(err) return reject(err)
                        resolve(rows || [])
                    })
            })
    }