const { Ticket } = require('../models/schema');
const { loggingMessageConstructor } = require('../utils/logFile');
const { ticketSchema } = require('../utils/modelSchema');
const { validateFields, validateUserData } = require('../utils/validateFields');

class TicketService{
    async store(reqTicket, creator){
        if(!creator) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("Ticket creation request without creator.", { reqTicket, creator }, "CREATE")
        }

        let errors = {}
        const ticketObj = validateFields(reqTicket)
        errors = validateUserData(ticketObj, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return{
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        ticketObj.creator = creator._id
        const ticket = await Ticket.create(ticketObj)

        return {
            success: true,
            data: ticket
        }
    }
}

module.exports = new TicketService();