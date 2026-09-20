import { getDB } from "../db/index.js";

export const createEvent = ({title , description , venue , start_time , status, organizer_id})=>
    {
        const db= getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    INSERT INTO events (title , description , venue , start_time , status , organizer_id)
                    VALUES (? , ? , ? , ? , ? , ?)
                    `
                const params = [title , description , venue , start_time , status || 'DRAFT', organizer_id]

                db.run(sql , params , function(err)
                {
                    if(err) return reject(err)
                    resolve({
                        id:this.lastID,
                        title,
                        description,
                        venue,
                        start_time,
                        status: status || 'DRAFT',
                        organizer_id
                    })
                })
            })
    }

export const getEventById = (eventId)=>
    {
        const db = getDB();
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    SELECT * FROM events
                        WHERE id = ?
                `
                db.get(sql , [eventId] , (err , row)=>
                    {
                        if(err) return reject(err)
                        
                        resolve(row)
                    })
            })
    }

export const getAllEvents =()=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    SELECT * FROM events
                        WHERE status = 'PUBLISHED'
                            ORDER BY start_time ASC
                `
                db.all(sql , [] , (err , rows)=>
                    {
                        if(err)  return reject(err)
                        resolve(rows)
                    })
            })
    }