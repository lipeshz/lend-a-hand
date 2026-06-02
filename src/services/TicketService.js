const { Ticket } = require('../models/schema');
const { ticketSchema } = require('../utils/modelSchema');
const { validateFields, validateUserData } = require('../utils/validateFields');

class TicketService{
    async store(reqTicket, creator){
        if(!creator) return {
            success: false,
            error: "BAD_REQUEST"
        }
        
        let errors = {}
        const ticket = validateFields(reqTicket)
        errors = validateUserData(ticket, ticketSchema, errors)

        if(Object.keys(errors).length > 0) return{
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        return {
            success: true,
            data: ticket
        }
    }
}

module.exports = new TicketService();