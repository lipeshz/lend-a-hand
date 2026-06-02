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
    }    
}

module.exports = TicketController