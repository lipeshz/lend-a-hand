// Importamos o service usando require
const { User } = require('../models/schema');
const UserService = require('../services/UserService');
const { responseErrorController } = require('../utils/responseErrorController')
const { loggingMessage } = require('../utils/logFile');


const UserController = {
    async store(req, res, next){
        try {
            // Captura os dados do body
            const { name, email, password, conf_password, type } = req.body;
            // Chamo o service (note que o seu import era UserService, então usamos o mesmo nome)
            const result = await UserService.store({ name, email, password, conf_password, type }, req.user);
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(201).json(result);
        } catch (error) {
            next(error)
        }
    },

    async index(req, res, next){
        try{
            const { id, name, email, type } = req.query
            const result = await UserService.index({ id, name, email, type }, req.user)
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async show(req, res, next){
        try{
            const { id } = req.params
            const result = await UserService.show(id, req.user)
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)
            
            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async update(req, res, next){
        try{
            const { id } = req.params
            const { name, email, password, type } = req.body
            const result = await UserService.update( id ,{ name, email, password, type }, req.user )
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async login(req, res, next){
        try{
            const { email, password } = req.body
            const result = await UserService.login({ email, password })
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)
            
            return res.status(200).json(result)
        }catch(error){
            next(error)
        }
    },

    async delete(req, res, next){
        try{
            const { id } = req.params
            const result = await UserService.delete(id, req.user)
            if(result.log) loggingMessage(result.log)
            if(!result.success) return responseErrorController(res, result)

            return res.status(204).json(result)
        }catch(error){
            next(error)
        }
    }
}

// Exportação padrão do CommonJS
module.exports = UserController;