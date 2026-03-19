const { Router } = require('express');
const UserController = require('../controllers/UserController'); // Note que removemos o .js

const userRoutes = Router();

// Rota de registro chamando o método do Controller
userRoutes.post('/register', UserController.store);
userRoutes.get('/search', UserController.search);
userRoutes.patch('edit', UserController.edit)

// Exportação padrão para ser usada no routes/index.js
module.exports = userRoutes;