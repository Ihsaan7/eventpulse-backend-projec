import { ApiError } from "../utils/apiError.js";

export const verifyRole = (...roles)=>
    {
        return(req , res , next)=>
            {
                if(!req.user)
                    {
                        throw new ApiError(401, "Unauthorized: User not found!")
                    }
                if(!roles.includes(req.user.role))
                    {
                        throw new ApiError(
                            403,
                            "Forbidden:You dont have permission to access this resource"
                        )
                    }
                    next();
            }
    }