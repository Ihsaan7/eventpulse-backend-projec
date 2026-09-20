import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { getEventById } from "../models/event.model.js";
import {
    getEventSalesSummary,
    getEventRemainingSeats,
    getEventTierBreakdown,
    getEventCheckinStats,
    getOrganizerOverview
} from "../models/analytics.model.js";


const getEventAnalyticsController = asyncHandler(async(req , res)=>
    {
        const { eventId } = req.params
        const event = await getEventById(eventId)

        if(!event){ throw new ApiError(404, "Event not found!")}
        if(event.organizer_id !== req.user.id && req.user.role !== "ADMIN")
            {
                throw new ApiError(403, "You dont have permission to view analytics!")
            }
        const [ summary , remaining_seats , tiers , checkedInCount]=await Promise.all([
            getEventSalesSummary(eventId),
            getEventRemainingSeats(eventId),
            getEventTierBreakdown(eventId),
            getEventCheckinStats(eventId)
        ])

        const paidBookings = Number(summary.paid_bookings) || 0;
        const attendancePercentage = paidBookings === 0 ? 0 : Number(((checkedInCount / paidBookings)*100).toFixed(2))

        const payload ={
            event:{
                id: event.id,
                title: event.title,
                venue:event.venue,
                start_time: event.start_time,
                status:event.status
            },
            sales:{
                    total_revenue: Number(summary.total_revenue) || 0,
            tickets_sold: Number(summary.tickets_sold) || 0,
            paid_bookings: paidBookings,
            remaining_seats: Number(remaining_seats) || 0,
            seats_locked: Number(summary.seats_locked) || 0,
            expired_quantity: Number(summary.expired_quantity) || 0
            },
        attendance: {
            checked_in_count: Number(checkedInCount) || 0,
            attendance_percentage: attendancePercentage
        },
        tiers
        }

        return res.status(200)
            .json(new ApiResponse(200 , payload , "Event analytics feteched successfully"))


    })

    const getOrganizerOverviewController = asyncHandler(async (req, res) => {
    const events = await getOrganizerOverview(req.user.id);

    return res
        .status(200)
        .json(new ApiResponse(200, events, "Organizer overview fetched successfully"));
});

export { getEventAnalyticsController, getOrganizerOverviewController };