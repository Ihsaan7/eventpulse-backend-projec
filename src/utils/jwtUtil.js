import jwt from "jsonwebtoken"

export const genAccessToken =(user)=>
    {
        return jwt.sign(
            {
                _id: user.id,
                email:user.email,
                role: user.role,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn:process.env.ACCESS_TOKEN_EXPIRY
            }
        
        )
            
    }

export const genRefreshToken= (user)=>
    {
        return jwt.sign(
            {
                _id: user.id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
        )
    }