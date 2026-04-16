const bcrypt = require('bcryptjs')
const { User } = require('../models/schema')
const { validateUserData, validateFields } = require('../utils/validateFields')
const userSchema = require('../utils/userSchema')
const filterFields = require('../utils/filterFields')

class UserService{
    async register(data) {
        const {name, email, password, conf_password, type} = data

        // Validação
        const errors = validateUserData(data, userSchema)
        console.log(errors)
        // Valida o formato primeiro
        if(Object.keys(errors).length === 0){
            // Verifica se o usuário existe (para não ficar fazendo requisições a toa)
            const userExists = await User.findOne({where: {email}})
            console.log("PAROU AQUI!!! 🚨🚨🚨🚨🚨")
            if(userExists) errors.email_err = "User already exists."
        }else{
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

    async search(filters){
        if(!filters) return []
        // Filtro os dados vindos dos header
        const data = filterFields(filters)
        
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find(data).select('-__v') // remove a senha para retornar
        return users
    }

    async update(data, context){
        // ALTERAR VALIDAÇÃO PARA JWT
        const { id, name, email, password, type } = data
        const { requestertype, requesterid } = context
        const requester = await User.findById(requesterid);
        let updates = {}

        if((requestertype != "user" || requestertype != "supervisor" || requestertype != "technical") && !requesterid)
            throw new Error("Invalid update request.")

        if(requestertype === "user" && id !== requesterid){
            const error = new Error("Invalid update request.")
            throw error
        }

        const permission = {
            "type": {
                supervisor: ['name', 'email', 'password', 'type'], technical: ['name', 'email', 'password', 'type'],
                user: ['name', 'email', 'password']
            }
        }

        const allowedFields = permission.type[requestertype] || permission.type.user

        updates = validateFields(data, allowedFields)
        const errors = validateUserData(updates, userSchema)

        if(Object.keys(updates).lenght == 0){
            throw new Error("Nenhum dado válido foi enviado para atualização.")
        }else if(Object.keys(errors).length > 0){
            const error = new Error("Validation failed.")
            error.details = errors
            throw error
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        )
        return user
    }

    async login(email, password){
        let details = {}
        const user = await User.findOne({ where: {email} })

        const pwMatch = await userSchema.methods.comparePassword(password)

        if(!pwMatch || !user)
            throw new Error("E-mail or password are wrong.")

        return user
    }
}

module.exports = new UserService();