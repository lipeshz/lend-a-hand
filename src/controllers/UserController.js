// Importamos o service usando require
const UserService = require('../services/UserService');

const UserController = {
    async store(req, res) {
        try {
            // Captura os dados do body
            const { name, email, password, conf_password, type } = req.body;
            // Chamo o service (note que o seu import era UserService, então usamos o mesmo nome)
            const user = await UserService.register({ name, email, password, conf_password, type });
            return res.status(201).json(user);
        } catch (error) {
            // Se houver erros de validação (aqueles que definimos com .details no Service)
            if (error.details) {
                return res.status(400).json({
                    status: "error",
                    message: "Validation failed.",
                    errors: error.details
                });
            }
            
            // Log para debug em caso de erro inesperado (banco, conexão, etc)
            console.error(error);
            return res.status(500).json({
                status: "error",
                message: "Internal error ->" + error
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
            const requesterId = req.userId
            const updatedUser = await UserService.update({ id, name, email, password, type }, userId )
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