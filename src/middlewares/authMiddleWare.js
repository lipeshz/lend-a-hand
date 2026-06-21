const jwt = require('jsonwebtoken')
const CacheService = require('../services/CacheService')
const { User } = require('../models/schema')
const { loggingMessageConstructor, loggingMessage } = require('../utils/logFile')

const authMiddleWare = async (req, res, next) => {
    try{
        // Captura o token da requisição
        const authHeader = req.headers.authorization
        // Retorna um erro caso o token não exista
        if(!authHeader) return res.status(401).send({error: "The token doesn't exists!"})

        const parts = authHeader.split(' ')[1]
        const token = parts
        const isBlocked = await CacheService.isTokenBlocked(token)

        if(isBlocked){
            const message = loggingMessageConstructor("Blocked token use attempt.", { token: token.substring(0, 15) }, "AUTH")
            loggingMessage(message)

            return res.status(401).send({error: "Unauthorized."})
        }
        // Valida o token e injeta no header para os outros controllers poderem acessar
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id).select('name email type').lean()
        if(!user) return res.status(401).send({error: "The user doesn't exists."})

        delete user.password
        delete user.__v

        req.user = user
        return next();
    }catch(error){
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).send({ error: 'Invalid or expired token!' });
        }
        next(error)
    } 
}

module.exports = { authMiddleWare }