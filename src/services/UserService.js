const bcrypt = require('bcryptjs')
const { User } = require('../models/schema')
const validateFields = require('../utils/validateFields')

class UserService{
    async register(data) {
        const {name, email, password, conf_password, type} = data
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|outlook|hotmail)\.com$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

        const errors = {}

        // Valida o formato primeiro
        if(name.length < 6) errors.name_err = "Too short."
        if(!emailRegex.test(email)) errors.email_err = "Invalid e-mail domain."
        if(!passwordRegex.test(password)) errors.pass_err = "Password too weak."
        if(password != conf_password) errors.pass_err = "Password don't match."
        if(type !== "user" || type !== "supervisor" || type !== "technical") errors.type = "Invalid user type."
        if(Object.keys(errors).length === 0){
            // Verifica se o usuário existe (para não ficar fazendo requisições a toa)
            const userExists = await User.findOne({where: {email}})
            if(userExists) errors.email_err = "User already exists."
        }

        if(Object.keys(errors).length > 0){
            // Instancia um erro com uma mensagem e os erros dos campos
            const error = new Error("Validation failed.")
            error.details = errors
            throw error
        }

        const user = await User.create({
                name,
                email,
                password,
                type
            })
        // Retorna o usuário sem senha por segurança
        const userObject = user.toObject()
        delete userObject.password;

        return userObject;
    }

    async search(query){
        // Recebo a query do controller
        const q = query
        
        // Se não houver query eu retorno vazio
        if(!q) return []
        const searchRegex = new RegExp(query, 'i')
        
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find({
            $or: [{ name: searchRegex }, { email: searchRegex }]
        }).select('-__v') // remove a senha para retornar
        return users
    }

    async update(data, context){
        const { id, name, email, password, type } = data
        const { requestertype, requesterid } = context
        let updates = {}
        const permission = {
            "type": {
                supervisor: ['name', 'email', 'password', 'type'], technical: ['name', 'email', 'password', 'type'],
                user: ['name', 'email', 'password']
            }
        }
        const allowedFields = permission.type[requestertype] || permission.type.user

        if(requestertype === "user"){
            if(id == requesterid){
                updates = validateFields(data, allowedFields)
                console.log("PAROU AQUI")
                if(updates == {}){
                    throw new Error("Nenhum dado válido foi enviado para atualização.")
                }
            }else{
                const error = new Error("Invalid update request.")
                throw error
            }
        }else if(requestertype === "supervisor" || requestertype === "technical"){
            updates = validateFields(data, allowedFields)
        }else{
            const error = new Error("Invalid update request.")
            throw error
        }
        
        if(Object.keys(updates).length === 0){
            throw new Error("Nenhum dado válido foi enviado para atualização.")
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        )
        return user
    }
}

module.exports = new UserService();