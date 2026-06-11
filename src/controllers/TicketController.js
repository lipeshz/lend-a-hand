const { Ticket } = require('../models/schema')
const TicketService = require('../services/TicketService')
const { loggingMessage } = require('../utils/logFile')
const { responseErrorController } = require('../utils/responseErrorController')

const TicketController = {
    async store(req, res, next){
        try{
            const { title, desc, urgency, category, image, status, openDate } = req.body
            const result = await TicketService.store({ title, desc, urgency, category, image, status, openDate }, req.user)

            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },
    
    async index(req, res, next){
        try{
            const { creator, title, urgency, category, status, openDate, closeDate } = req.params
            const result = await TicketService.index({ creator, title, urgency, category, status, openDate, closeDate }, req.user)
            
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async show(req, res, next){
        try{
            const { _id } = req.params
            const result = await TicketService.show(id, req.user)

            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async update(req, res, next){
        try{
            const { title, desc, urgency, category, image, status, closeDate, technical, solution } = req.body
            const { id } = req.params
            const result = await TicketService.update(id, { title, desc, urgency, category, image, status, closeDate, technical, solution }, req.user)

            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async delete(req, res, next){
        try{
            const { id } = req.params
            const result = await TicketService.delete(id, req.user);

            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    }
}

module.exports = TicketController