const { Ticket } = require('../models/schema');
const { loggingMessageConstructor } = require('../utils/logFile');
const { ticketSchema } = require('../utils/modelSchema');
const mongoose = require('mongoose')
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
        updates = removeUndefinedFields(data)

        const notAllowedFields = {
            supervisor: [ "title", "desc", "image", "urgency", "category", "closeDate" ],
            technical: [ "title", "desc", "image", "urgency", "category", "closeDate" ],
            user: [ "status", "closeDate", "technical", "solution" ]
        }

        const forbiddenFields = notAllowedFields[requester?.type] || []
        const invalidFieldAttempt = Object.keys(updates).find(field => forbiddenFields.includes(field));

        if(invalidFieldAttempt) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to change this field.", { requester, update: updates }, "TICKET: UPDATE")
        }

        errors = schemaValidation(updates, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const { User } = require('../models/schema')
        const [ticketObj, technical] = await Promise.all([
            Ticket.findById(ticketId).select('-__v'),
            updates.technical ? User.findById(updates.technical).lean() : null
        ])

        if(!ticketObj) return {
            success: false,
            error: "NOT_FOUND"
        }

        if(technical && !["supervisor", "technical"].includes(technical.type)) return {
            success: false,
            error: "UNAUTHORIZED",
            log: loggingMessageConstructor("The technical can't be a user.", { requester, target: ticketId, request: updates }, "TICKET: UPDATE")
        }

        if(!["supervisor", "technical"].includes(requester.type) && String(requester.id) != String(ticketObj.creator)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to access this ticket.", { requester, target: ticketObj, update: updates }, "TICKET: UPDATE")
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
        if(!["supervisor", "technical"].includes(requester.type)) return {
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