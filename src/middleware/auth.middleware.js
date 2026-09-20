import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/apiResponse.js";
import { getDB } from "../db/index.js";
import { findUserByEmail , findUserById } from "../models/user.model.js";


export const verifyJwt = asyncHandler(async(req , res  ,next)=>
    {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");

        if(!token){throw new ApiError(401, "Unauthorized request!")}

        let decodedToken;
        try{
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        }catch(err)
        {
            throw new ApiError(401, "Invalid or expired Access Token")
        }
        const db = getDB()
        const user = await findUserById(decodedToken._id)

        if(!user){throw new ApiError(401, "Invalid Access Token: User not found!")}

        req.user = user
        next()
    })