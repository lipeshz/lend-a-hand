const { Ticket } = require('../models/schema');
const { loggingMessageConstructor } = require('../utils/logFile');
const { ticketSchema } = require('../utils/modelSchema');
const mongoose = require('mongoose')
const { removeUndefinedFields, schemaValidation } = require('../utils/validateFields');
const { ROLES, TICKET_RULES } = require('../utils/permissions')

class TicketService{
    async store(reqTicket, creator){
        if(!creator) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { target: ticketId, data, requester}, "TICKET: UPDATE")
        }

        if(!TICKET_RULES.CREATE_TICKET.includes(creator.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Create ticket attempt.", { creator, reqTicket }, "TICKET: STORE")
        }

        let errors = {}
        errors = schemaValidation(reqTicket, ticketSchema)

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
        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { target: ticketId, data, requester}, "TICKET: UPDATE")
        }

        const filters = removeUndefinedFields(reqFilters)
        let tickets = {}
        
        if(requester.type == "supervisor" || requester.type == "technical") tickets = await Ticket.find(filters).lean()
        
        if(requester.type === "user"){ 
            filters.creator = requester._id
            tickets = await Ticket.find(filters).lean()
        }
        return {
            success: true,
            data: tickets
        }
    }

    async show(ticketId, requester){

        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { target: ticketId, data, requester}, "TICKET: UPDATE")
        }

        if(!mongoose.Types.ObjectId.isValid(ticketId)) return {
            success: false,
            error: "NOT_FOUND",
            log: loggingMessageConstructor("The ticket ID format is invalid.", { requester, target: ticketId}, "TICKET: SHOW")
        }

        const ticket = await Ticket.findById(ticketId).select('-__v')

        if(!ticket) return {
            success: false,
            error: "NOT_FOUND"
        }

        if(requester.type == "user" && String(ticket.creator) != String(requester._id)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to access this data.", { requester, target: ticket }, "TICKET: SHOW")
        }

        return {
            success: true,
            data: ticket
        }
    }

    async update(ticketId, data, requester){
        let updates = {}
        let errors = {}
        let forbiddenFields = {}

        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { target: ticketId, data, requester}, "TICKET: UPDATE")
        }

        updates = removeUndefinedFields(data)

        errors = schemaValidation(updates, ticketSchema)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const { User } = require('../models/schema')
        const [ticketObj, technical] = await Promise.all([
            Ticket.findById(ticketId).select('-__v'),
            updates.technical && mongoose.Types.ObjectId.isValid(updates.technical) ? User.findById(updates.technical).lean() : null
        ])

        if(!ticketObj) return {
            success: false,
            error: "NOT_FOUND"
        }

        if(updates.technical && !technical) return {
            success: false,
            error: "NOT_FOUND",
        }

        const isOwner = String(requester.id) !== String(ticketObj.creator)

        Object.keys(updates).forEach(key => {
            if(!TICKET_RULES.TICKET_UPDATE_RULES[key].includes(requester.type) && !isOwner){
                forbiddenFields[key] = key
            }
        })

        if(Object.keys(forbiddenFields).length > 0) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to change this field.", { requester, update: updates }, "TICKET: UPDATE")
        }

        if(technical && !["supervisor", "technical"].includes(technical.type)) return {
            success: false,
            error: "UNAUTHORIZED",
            log: loggingMessageConstructor("The technical can't be a user.", { requester, target: ticketId, request: updates }, "TICKET: UPDATE")
        }

        ticketObj.set(updates)
        await ticketObj.save()
        const ticket = ticketObj.toObject()

        return { 
            success: true,
            data: ticket
        }
    }

    async delete(ticketId, requester){

        if(!requester) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Invalid requester.", { target: ticketId, data, requester}, "TICKET: UPDATE")
        }

        if(!TICKET_RULES.DELETE_TICKET.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to delete this ticket.", { requester, target: ticketId }, "TICKET: DELETE")
        }

        const ticket = await Ticket.findByIdAndDelete(ticketId).lean()

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