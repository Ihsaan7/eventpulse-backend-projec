import jwt from "jsonwebtoken"

export const genAccessToken =(user)=>
    {
        return jwt.sign(
            {
                _id: user.id,
                email:user.email,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET || "eventpulse_access_secret_key_default",
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY || "1d"
            }
        
        )
            
    }

export const genRefreshToken= (user)=>
    {
        return jwt.sign(
            {
                _id: user.id
            },
            process.env.REFRESH_TOKEN_SECRET || "eventpulse_refresh_secret_key_default",
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY || "7d"
            }
        )
    }