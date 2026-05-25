// Importamos o service usando require
const UserService = require('../services/UserService');

const UserController = {
    async store(req, res, next) {
        try {
            // Captura os dados do body
            const { name, email, password, conf_password, type } = req.body;
            // Chamo o service (note que o seu import era UserService, então usamos o mesmo nome)
            const result = await UserService.register({ name, email, password, conf_password, type }, req.userId);

            if(!result.success){
                return res.status(result.statusCode).json({
                    status: "error",
                    message: result.message
                })
            }

            return res.status(201).json(result);
        } catch (error) {
            // Se houver erros de validação (aquele que defini com .details no Service)
            if (error) {
                next(error)
            }
        }
    },

    async index(req, res){
        try{
            const { name, email, type } = req.query
            
            const result = await UserService.search({ name, email, type })
            return res.status(200).json(result)
        }catch(error){
            return res.status(500).json({error: error.message})
        }
    },

    async show(req, res){
        try{

        }catch(error){

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

    async login(req, res){
        try{
            const { email, password } = req.body
            const loginUser = await UserService.login({ email, password })
            return res.status(200).json(loginUser)
        }catch(error){
            return res.status(500).json({error: error.message})
        }
    }
}

// Exportação padrão do CommonJS
module.exports = UserController;