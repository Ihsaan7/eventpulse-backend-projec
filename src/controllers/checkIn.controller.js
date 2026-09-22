import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { findCheckinByQRCode , markTicketAsCheckedIn } from "../models/checkIn.model.js";




const validateCheckinController = asyncHandler(async(req , res)=>
    {
        const { qr_code } = req.body
        if(!qr_code){ throw new ApiError(400, "qr_code is required!")}

        const ticket = await findCheckinByQRCode(qr_code)
        if(!ticket){ throw new ApiError(404, "Invalid QR-Code ")}

        if(ticket.booking_status !== "PAID")
            {
                throw new ApiError(400 , " This booking is not paid! Entry denied.")
            }
        if(ticket.checked_in_at)
            {
                throw new ApiError(409, "This ticket has already been checked in!")
            }
        if(req.user.role !== "ADMIN" && req.user.role !== "ORGANIZER" && ticket.organizer_id !== req.user.id)
            {
                throw new ApiError(403 ,"You don't have permission to scan tickets! Gate check-in is restricted to Organizers.")
            }
        const updated = await markTicketAsCheckedIn(qr_code , req.user.id)
        if(!updated){ throw new ApiError(500, "Failed to check in the tickets")}

        return res.status(200).json(
            new ApiResponse(200,
                {
                    attendee_name: ticket.attendee_name,
                    event_title: ticket.event_title,
                    tier_name:ticket.tier_name,
                    quantity:ticket.quantity,
                    checked_in_at: new Date().toISOString()
                },
                "Ticket checked in successfully"
            )
        )
    })
    
export { validateCheckinController}