const { Router } = require('express');
const { authMiddleWare } = require('../middlewares/authMiddleWare')
const { errorHandler } = require('../middlewares/errorMiddleWare')
const { User } = require('../models/schema')
const TicketController = require('../controllers/TicketController'); // Note que removemos o .js

const ticketRoutes = Router();

// Definição da rota
// ticketRoutes.post('/register', ticketController.register);
ticketRoutes.post('/ticket', authMiddleWare, TicketController.store);
ticketRoutes.get('/ticket', authMiddleWare, TicketController.index);
ticketRoutes.get('/ticket/:id', authMiddleWare, TicketController.show);
ticketRoutes.patch('/ticket/:id', authMiddleWare, TicketController.update);
ticketRoutes.delete('/ticket/:id', authMiddleWare, TicketController.delete);

ticketRoutes.use(errorHandler)
// Exportação obrigatória para o index.js das rotas
module.exports = ticketRoutes;