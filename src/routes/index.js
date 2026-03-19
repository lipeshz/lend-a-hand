import { Router } from 'express'
const userRoutes = require('user.routes')
const ticketRoutes = require('ticket.routes')

const rootRouter = Router()

// Define as rotas espefícias para cada classe
rootRouter.use('/users', userRoutes)
rootRouter.use('/tickets', ticketRoutes)

module.exports = rootRouter