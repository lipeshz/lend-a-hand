const { Router } = require('express');
const authMiddleWare = require('../middlewares/authMiddleWare')
const { User } = require('../models/schema')
const UserController = require('../controllers/UserController'); // Note que removemos o .js

const userRoutes = Router();

// Rota de registro chamando o método do Controller
// Insere um usuário
userRoutes.post('/users', UserController.store);

// Retorna os usuários
userRoutes.get('/users', UserController.index);

// Retorna um usuário específico
userRoutes.get('/users/:id', UserController.show);

// Edita um usuário
userRoutes.patch('/users/:id', authMiddleWare, UserController.update);

// CONCLUIR JWT
userRoutes.post('/users/login', UserController.login);

// Exportação padrão para ser usada no routes/index.js
module.exports = userRoutes;