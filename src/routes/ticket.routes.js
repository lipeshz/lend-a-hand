const { Router } = require('express');
// const ticketController = require('../controllers/ticketController'); // Caminho para o seu controller

const ticketRoutes = Router();

// Definição da rota
// ticketRoutes.post('/register', ticketController.register);

// Exportação obrigatória para o index.js das rotas
module.exports = ticketRoutes;