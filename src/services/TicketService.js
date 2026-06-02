const { Ticket } = require('../models/schema');
const { loggingMessageConstructor } = require('../utils/logFile');
const { ticketSchema } = require('../utils/modelSchema');
const { validateFields, validateUserData } = require('../utils/validateFields');

class TicketService{
    async store(reqTicket, creator){
        if(!creator) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("Ticket creation request without creator.", { reqTicket, creator }, "TICKET: CREATE")
        }

        let errors = {}
        errors = validateUserData(reqTicket, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return{
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const ticketObj = validateFields(reqTicket)

        ticketObj.creator = creator._id
        const ticket = await Ticket.create(ticketObj)

        return {
            success: true,
            data: ticket
        }
    }

    async index(reqFilters, requester){
        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { filters }, "TICKET: INDEX")
        }

        const filters = validateFields(reqFilters)
        let tickets = {}

        if(["supervisor", "technical"].includes(requester.type)) tickets = await Ticket.find(filters).select('-__v')
        
        if(requester.type === "user") tickets = await Ticket.find(filters).where('creator').equals(String(requester._id)).select('-__v')

        return {
            success: true,
            data: tickets
        }
    }

    async show(ticketId, requester){
        if(!mongoose.Types.ObjectId.isValid(ticketId)) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("The ticket ID format is invalid.", { requester, target: ticketId}, "TICKET: SHOW")
        }

        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester", { requester }, "TICKET: SHOW")
        }

        // if(["supervisor", "techical"].includes(requester.type)) 
    }
}

module.exports = new TicketService();