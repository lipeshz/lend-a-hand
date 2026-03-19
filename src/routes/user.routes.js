import { Router } from 'express'
const userRoutes = Router()

userRoutes.post('/register', UserController.register)

module.exports = rootRouter;