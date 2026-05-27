// Importamos o service usando require
const { User } = require('../models/schema');
const UserService = require('../services/UserService');
const { loggingMessage } = require('../utils/logFile');
const { errorMap } = require('../utils/errorMap')

const UserController = {
    async store(req, res, next) {
        try {
            // Captura os dados do body
            const { name, email, password, conf_password, type } = req.body;
            // Chamo o service (note que o seu import era UserService, então usamos o mesmo nome)
            const result = await UserService.store({ name, email, password, conf_password, type }, req.userId);

            if(!result.success){
                if(result.log){
                    loggingMessage(result.log)
                }

                const { statusCode, message} = errorMap(result.message)

                return res.status(statusCode).json({
                    status: "error",
                    err_message: message
                })
            }

            return res.status(201).json(result);
        } catch (error) {
            next(error)
        }
    },

    async index(req, res, next){
        try{
            const { id, name, email, type } = req.query
            const requesterId = req.userId
            const result = await UserService.index({ id, name, email, type }, requesterId)
            
            if(!result.success){
                return res.status(result.statusCode).json({
                    status: "error",
                    statusCode: result.statusCode,
                    message: result.message
                })
            }
            return res.status(result.statusCode).json(result)
        }catch(error){
            if(error){
                next(error)
            }
        }
    },

    async show(req, res, next){
        try{
            const { id } = req.params
            const result = await UserService.show(id, req.userId)
            console.log(result)
            return res.status(200).json({
                status: "error",
                message: result.message
            })
        }catch(error){
            if(error){
                next(error)
            }
        }
    },

    async update(req, res, next){
        try{
            const { id } = req.params
            const { name, email, password, type } = req.body
            const result = await UserService.update({ id, name, email, password, type }, req.userId )
            
            if(!result.success){
                return res.status(result.statusCode).json({
                    status: "error",
                    message: result.message
                })
            }

            return res.status(result.statusCode).json(result)
        }catch(error){
            if(error){
                next(error)
            }
        }
    },

    async delete(req, res, next){
        try{
            const { id } = req.params
            const { userId } = req
            const result = await UserService.delete(id, userId)

            if(!result.success){
                return res.status(result.statusCode).json({
                    status: "error",
                    message: result.message
                })
            }

            return res.status(result.statusCode).json(result)
        }catch(error){
            next(error)
        }
    },

    async login(req, res, next){
        try{
            const { email, password } = req.body
            const result = await UserService.login({ email, password })

            if(!result.success){
                return res.status(result.statusCode).json({
                    status: "error",
                    message: result.message
                })
            }
            
            return res.status(result.statusCode).json(result)
        }catch(error){
            if(error){
                next(error)
            }
        }
    }
}

// Exportação padrão do CommonJS
module.exports = UserController;