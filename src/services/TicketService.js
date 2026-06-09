const { Ticket } = require('../models/schema');
const { loggingMessageConstructor } = require('../utils/logFile');
const { ticketSchema } = require('../utils/modelSchema');
const { removeUndefinedFields, schemaValidation } = require('../utils/validateFields');

class TicketService{
    async store(reqTicket, creator){
        let errors = {}
        errors = schemaValidation(reqTicket, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return{
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const ticketObj = removeUndefinedFields(reqTicket)

        ticketObj.creator = creator._id
        const ticket = await Ticket.create(ticketObj)

        return {
            success: true,
            data: ticket
        }
    }

    async index(reqFilters, requester){
        const filters = removeUndefinedFields(reqFilters)
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

        const ticket = await Ticket.findById(ticketId).select('-__v')

        // if(["supervisor", "techical"].includes(requester.type)) 

        if(["user"].includes(requester.type) && String(ticket.creator) != requester._id) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester does'nt have permission to access this data.", { requester, ticket }, "TICKET: SHOW")
        }

        return {
            success: true,
            data: ticket
        }
    }

    async update(data, requester){
        let updates = {}
        let errors = {}
        updates = removeUndefinedFields(data)
        console.log(updates)
        console.log(data)

        const allowedFields = {
            supervisor: [ "status", "closeDate", "technical" ],
            technical: [ "status", "closeDate", "technical" ],
            user: [ "title", "desc", "image", "urgency", "category", "status", "closeDate" ]
        }

        if(!Object.keys(updates).includes(allowedFields[requester.type])) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to change the technical.", { requester, updates }, "TICKET: UPDATE")
        }

        errors = schemaValidation(updates, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const ticket = await Ticket.findById(data.id).select('-__v')

        return { 
            success: true,
            data: updates
        }
    }

    async delete(ticketId, requester){
        if(!["supervisor", "technical"].includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to delete this ticket.", { requester, target: ticketId }, "TICKET: DELETE")
        }

        const ticket = await Ticket.findOneAndDelete(ticketId).lean()
        if(!ticket) return {
            success: false,
            error: "NOT_FOUND",
        }

        return {
            success: true,
            data: ticket
        }
    }
}

module.exports = new TicketService();