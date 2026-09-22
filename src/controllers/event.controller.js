import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { getDB } from "../db/index.js"
import { createEvent , getAllEvents, getEventById } from "../models/event.model.js"
import { createTicket , getTiersByEventId } from "../models/ticket.model.js"

const createEventController = asyncHandler(async(req , res)=>
    {
        const {title , description , venue , start_time , status , tiers} = req.body

        if(!title || !venue || !start_time || !tiers || !Array.isArray(tiers) || tiers.length === 0)
            {
                throw new ApiError(400 , "Title, venue, start_time, and at least one ticket tier are required")
            }

        const organizer_id = req.user.id

        const event = await createEvent(
            {
        title,
        description,
        venue,
        start_time,
        status,
        organizer_id
            })

        const createdTiers = await createTicket(event.id , tiers)

        return res.status(201).json
        (
            new ApiResponse(201, { event , tiers: createdTiers }, "Event and ticket tiers created successfully")
        )
    })

const getEventsController = asyncHandler(async (req , res)=>
    {
        const events = await getAllEvents();
        const eventsWithTiers = await Promise.all(
            (events || []).map(async (ev) => {
                const tiers = await getTiersByEventId(ev.id);
                return { ...ev, tiers };
            })
        );
        return res.status(200).json(new ApiResponse(200, eventsWithTiers, "Events fetched successfully"))
    })

const getEventByIdController = asyncHandler(async(req , res)=>
    {
        const { id } = req.params
        const event = await getEventById(Number(id))
        
        if(!event)
            {
                throw new ApiError(404, "Event not found")
            }

        const tiers = await getTiersByEventId(Number(id));

        return res.status(200).json(
            new ApiResponse(200 , { ...event, tiers } , "Event fetched successfully!")
        )
    })

export { createEventController, getEventsController, getEventByIdController }