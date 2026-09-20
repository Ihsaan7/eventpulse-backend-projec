import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { createPendingBooking , findBookingById , markBookingPaid} from "../models/booking.model.js";
import {getDB}  from "../db/index.js"
import crypto from "crypto"

const lockSeatController = asyncHandler(async(req , res)=>
    {
        const {tier_id , quantity } = req.body
        const userId = req.user.id;

        if(!tier_id || !quantity || quantity <= 0)
            {
                throw new ApiError(400, "Tier_id and a positive quanrtity are required!")
            }
        
        try
        {
            const booking = await createPendingBooking(userId ,tier_id , quantity)
            return res.status(201).json(
                new ApiResponse(201, booking , "Seats locked! You have 10 minutes to pay!")
            )
        }catch(err)
        {
            throw new ApiError(400, err.message || "Booking failed!")
        }
    })

const payBookingController = asyncHandler(async(req , res)=>
    {
         const { booking_id } = req.body
         const userId = req.user.id

         if(!booking_id){ throw new ApiError(400, "Booking ID is required!")}

         const booking  = await findBookingById(booking_id)
         if(!booking){ throw new ApiError(404, "Booking not found!")}

         if(booking.attendee_id !== userId)
            { 
                throw new ApiError(403 ,"Forbidden: This booking belongs to another User!")
            }
         if(booking.booking_status === "PAID")
            {
                throw new ApiError(400 , "This booking is already paid!")
            }
        const now = new Date();
        const expires_at = new Date(booking.seat_lock_expires_at)
        if(now > expires_at && booking.booking_status === "PENDING_LOCK")
            {
                throw new ApiError(410, "Lock expired. Please initiate a new Booking.")
            }
        //-------- Payment initation -----------
        await markBookingPaid(booking_id)

        const qrCode = crypto.randomUUID();
        const db = getDB()

        await new Promise((resolve , reject)=>
            {
                const sql =`
                    INSERT INTO checkins(booking_id , qr_code , verified_by_organizer_id)
                        VALUES(? , ? , ?)
                `
                const params = [booking_id , qrCode , null]
                db.run(sql , params , (err)=>
                    {
                        if(err) return reject(err)
                            resolve()
                    })
            })

        return res.status(200).json(
            new ApiResponse(200 , {booking_id , qr_code:qrCode}, "Payment succesful! Ticket issued.")
        )
    })

export { lockSeatController, payBookingController };
