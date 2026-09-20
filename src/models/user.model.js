import { getDB } from "../db/index.js";

export const findUserByEmail = async(email)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT * FROM users
                        WHERE email = ?
                `
                db.get(sql ,[email], (err , row)=>
                    {
                        if(err) return reject(err);
                        resolve(row)
                    })
            })
    }

export const findUserById = async(id)=>
    {
        const db = getDB();
        return new Promise((resolve , reject)=>
            {
                const sql=`
                    SELECT id , name , email , role , created_at
                        FROM users
                            WHERE id = ?
                `
                db.get(sql , [id], (err , row)=>
                    {
                        if(err) return reject(err)
                        resolve(row)
                    })
            })
    }


export const createUser = async({ name , email , passwordHash , role = "ATTENDEE"})=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    INSERT INTO users (name , email , password_hash , role)
                        VALUES (? ,? ,? ,?)
                `
                const params =[name , email , passwordHash , role]
                db.run(sql , params , function(err)
                {
                    if(err) return reject(err)
                    resolve(
                {
                    id:this.lastID,
                    name,
                    email,
                    role
                })
                })
            })
    }


export const updateRefreshToken = async(userId , refreshToken)=>
    {
        const db = getDB()
        return new Promise((resolve , reject)=>
            {
                const sql =`
                    UPDATE users SET refresh_token = ?,
                    updated_at = CURRENT_TIMESTAMP
                        WHERE id = ?
                `
                db.run(sql , [refreshToken , userId] , function(err)
                {
                    if(err) return reject(err)
                    resolve(this.changes > 0)
                })
            })
    }