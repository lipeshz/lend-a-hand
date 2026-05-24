// Importamos o service usando require
const UserService = require('../services/UserService');

const UserController = {
    async store(req, res) {
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
                return res.status(500).json({
                    status: "critical_error",
                    message: "Critical server error.",
                });
            }
            
            // Log para debug em caso de erro inesperado (banco, conexão, etc)
            console.error(errors);
            return res.status(500).json({
                status: "error",
                message: "Internal error ->" + errors
            });
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

    async update(req, res){
        try{
            const { id } = req.params
            const { name, email, password, type } = req.body
            const updatedUser = await UserService.update({ id, name, email, password, type }, req.userId )
            return res.status(204).json(updatedUser)
        }catch(error){
            return res.status(500).json({error: error.message})
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