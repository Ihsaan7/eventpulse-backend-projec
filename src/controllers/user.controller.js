import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { getDB } from "../db/index.js"
import { hashPass , comparePass } from "../utils/passUtil.js"
import { genAccessToken , genRefreshToken } from "../utils/jwtUtil.js"
import jwt from "jsonwebtoken"
import {
    createUser,
    findUserByEmail,
    findUserById,
    updateRefreshToken
} from "../models/user.model.js"

const registerUser = asyncHandler(async( req , res)=>
    {
        const {name ,email , password , role} = req.body
   

        if([name , email , password ].some((field)=> field?.trim() === ""))
            {
                throw new ApiError(400 , "All fields are required!")
            }
        
        const db = getDB()
        const existedUser = await findUserByEmail(email)
        if(existedUser){ throw new ApiError(400, "User with this mail already exists!")}

        const hashPassword = await hashPass(password)

        const user = await createUser(
            {
                name:name.trim(),
                email:email.trim(),
                passwordHash:hashPassword,
                role: role || "ATTENDEE"
            })

        if(!user){ throw new ApiError(500 , "Something went wrong while registerting user!")}

        return res
            .status(201)
            .json(new ApiResponse(201 , user , "User registered successfully"))
    })


const loginUser = asyncHandler(async(req ,res)=>
    {
        const { email , password } = req.body
        const db = getDB()

        if(!email || !password){ throw new ApiError(400, "Both fields are required!")}

        const user = await findUserByEmail( email)
        if(!user){ throw new ApiError(404, "No user found!")}

        const isPassValid = await comparePass(password , user.password_hash)
        if(!isPassValid){throw new ApiError(401, "Invalid user credentials!")}

        const accessToken = genAccessToken(user)
        const refreshToken = genRefreshToken(user)

        await updateRefreshToken(user.id , refreshToken)

        const { password_hash , refresh_token , ...cleanUser} = user

        const options={
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }

        return res
            .status(200)
            .cookie("accessToken" , accessToken , options)
            .cookie("refreshToken" , refreshToken , options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user:cleanUser,
                        accessToken,
                        refreshToken
                    },
                    "User Logged in Successfully"
                )
            )
    })


const logoutUser = asyncHandler(async(req , res)=>
    {
        const db = getDB()

        await updateRefreshToken(req.user.id, null)

        const options=
        {
            httpOnly: true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict"
        }
    
    return res
        .status(200)
        .clearCookie("accessToken" , options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200 , {} ,"User logged out successfully"))
    })






const refreshAccessTokenController = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request: No refresh token");
    }

    let decoded;
    try {
        decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired refresh token");
    }

    const db = getDB();
    const user = await findUserById(decoded._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user.refresh_token) {
        throw new ApiError(401, "Refresh token is expired or has been used");
    }


    const newAccessToken = genAccessToken(user);
    const newRefreshToken = genRefreshToken(user);


    await updateRefreshToken(user.id, newRefreshToken);

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    };

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken: newAccessToken, refreshToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

export { registerUser, loginUser, logoutUser, refreshAccessTokenController };