const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const { User } = require('../models/schema')
const { validateUserData, validateFields } = require('../utils/validateFields')
const userSchema = require('../utils/userSchema')
const filterFields = require('../utils/filterFields')

class UserService{
    async register(data, requesterId) {
        try{
            const {name, email, password, conf_password, type} = data
            const requester = await User.findById(requesterId)
            const userExists = await User.findOne({email: data.email})
            const errors = {}

            // Verifica se o usuário existe (para não ficar fazendo requisições a toa)
            if(userExists){ 
                return {
                    success: false,
                    statusCode: 409,
                    message: "User already exists."
                }
            }else if(requester.type != "supervisor" && requester.type != "technical"){
                return {
                    success: false,
                    statusCode: 403,
                    message: "Invalid requester type."
                }
            }

            // Validação
            validateUserData(data, userSchema, errors)

            if(Object.keys(errors).length > 0) return { success: false, statusCode: 422, message: errors }

            const userObj = await User.create({
                    name,
                    email,
                    password,
                    type
                })

            // Retorna o usuário sem senha por segurança
            const user = userObj.toObject()
            delete user.password;
            delete user.__v;

            return user;
        }catch(error){
            throw error;
        }
        
    }

    async search(filters){
        if(!filters) return []
        // Filtro os dados vindos dos header
        const data = filterFields(filters)
        
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find(data).select('-__v') // remove a senha para retornar
        return users
    }

    async update(data, requesterId){
        // ALTERAR VALIDAÇÃO PARA JWT
        const { id, name, email, password, type } = data
        const requester = await User.findById(requesterId);
        let updates = {}
        if((requester.type != "user" || requester.type != "supervisor" || requester.type != "technical") && !requesterId)
            throw new Error("Invalid update request.")

        if(requester.type === "user" && id !== requesterId){
            const error = new Error("Invalid update request.")
            throw error
        }

        const permission = {
            "type": {
                supervisor: ['name', 'email', 'password', 'type'], technical: ['name', 'email', 'password', 'type'],
                user: ['name', 'email', 'password']
            }
        }

        const allowedFields = permission.type[requester.type] || permission.type.user

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

    // RETORNAR ERROS AO CONTROLLER
    async login(data){
        let details = {}
        const { email, password } = data
        let userObj = await User.findOne({ email: email })

        if(!userObj)
            throw new Error("E-mail or password are incorrect.")

        const pwMatch = await userObj.comparePassword(password)

        if(!pwMatch)
            throw new Error("E-mail or password are incorrect.")

        const token = jwt.sign(
            {id: userObj.id, email: userObj.email},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        const user = userObj.toObject()
        delete user.password;
        delete user.__v;

        return {user, token}
    }
}

module.exports = new UserService();