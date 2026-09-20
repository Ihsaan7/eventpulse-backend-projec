import { ApiError } from "../utils/apiError.js";

const errorHandler=(err , req , res,  next)=>
    {
        let error = err

        if(!(error instanceof ApiError))
            {
                const statusCode = err.statusCode || 500;
                const message = err.message || "Something went wrong";
                error= new ApiError(
                    statusCode,
                    message,
                    error?.errors || [],
                    err?.stack
                )
            }


        return res.status(error.statusCode).json({
            success:false,
            message:error.message,
            errors:error.errors,
            stack:process.env.NODE_ENV === "development" ? error.stack : undefined
        })
    }

export {errorHandler}