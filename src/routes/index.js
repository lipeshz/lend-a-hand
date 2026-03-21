const { Router } = require('express');
const userRoutes = require('./user.routes');   // No CommonJS, o .js é opcional
const ticketRoutes = require('./ticket.routes');

const rootRouter = Router();

// Agrupamento de rotas
rootRouter.use('/', userRoutes);
rootRouter.use('/', ticketRoutes);

// Exportação padrão do CommonJS
module.exports = rootRouter;