const { Router } = require('express');
const UserController = require('../controllers/UserController'); // Note que removemos o .js

const userRoutes = Router();

// Rota de registro chamando o método do Controller
userRoutes.post('/users', UserController.store);
userRoutes.get('/users', UserController.index);
userRoutes.get('/users/:id', UserController.show);
userRoutes.patch('/users/:id', UserController.update);

// Exportação padrão para ser usada no routes/index.js
module.exports = userRoutes;