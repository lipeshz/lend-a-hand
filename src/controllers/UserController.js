// Importo o service para acessar as funções
import userService from '../services/UserService';

// Defino o controller e seus métodos
const UserController = {
    async store(req, res) {
        try{
            // Defino as variáveis do body
            const {name, email, password, conf_password, type} = req.body

            // Chamo o service com os dados do usuário
            const user = await userService.register({name, email, password, conf_password, type})

            return res.status(201).json(user)
        }catch(error){
            if(error.details){
                return res.status(400).json({
                    status: "error",
                    "message": "Validation failed.",
                    "errors": error.details
                })
            }
            
            console.error(error)
            return res.status(500).json({
                "status": "error",
                "message": "Internal error."
            })
        }
    }
}

module.exports = UserController;