const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const { User } = require('../models/schema')
const { validateUserData, validateFields, filterUpdates } = require('../utils/validateFields')
const userSchema = require('../utils/userSchema')
const filterFields = require('../utils/filterFields')
const { loggingMessageConstructor } = require('../utils/logFile')

class UserService{
    async store(data, requesterId) {
        const {name, email, password, conf_password, type} = data
        const requester = await User.findById(requesterId).select('-password')
        const userExists = await User.findOne({email: data.email})
        const errors = {}

        // Verifica se o usuário existe (para não ficar fazendo requisições a toa)
        if(userExists) return {
                success: false,
                message: "USER_ALREADY_EXISTS",
            }

        if(requester.type != "supervisor" && requester.type != "technical") return {
                success: false,
                message: "FORBIDDEN",
                log: await loggingMessageConstructor("MESSAGE: The requester doesn't have permission to create a new user.", { requester })
            }

        // Validação
        validateUserData(data, userSchema, errors)

        if(Object.keys(errors).length > 0) return {
            success: false,
            statusCode: 422,
            message: errors
        }

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
    }

    async index(filters, requesterId){

        if(!filters) return {
            success: false,
            statusCode: 400,
            message: "There is no data"
        }

        if(!requesterId) return {
            success: false,
            statusCode: 400,
            message: "There is no requester ID."
        }

        const requester = await User.findById(requesterId)

        if(requester.type != "supervisor" && requester.type != "technical") return {
            success: false,
            statusCode: 403,
            message: "Forbidden"
        }

        // Filtro os dados vindos dos header
        const data = filterFields(filters)
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find(data).select('-__v') // remove a senha para retornar

        if(filters = {}) return {
            users,
            success: true,
            statusCode: 200,
            message: "All users"
        }

        // return { users, success: true, statusCode: 200, message: "Success."}
    }

    async show(userId, requesterId){
        const requester = await User.findById(requesterId).select('-password')

        if(!requester) return {
            success: false,
            statusCode: 404,
            message: "Forbidden"
        }

        if(userId != requesterId){
            if(requester.type != "supervisor" && requester.type != "technical") return {
                success: false,
                statusCode: 403,
                message: "Forbidden"
            }
        }

        const user = await User.findById(userId).select('-password')

        if(!user) return {
                success: false,
                statusCode: 404,
                message: "User not found."
            }

        return { user, success: true, statusCode: 200, message: "Success." }
    }

    async update(data, requesterId){
        // ALTERAR VALIDAÇÃO PARA JWT
        const { id, name, email, password, type } = data
        const requester = await User.findById(requesterId);

        if(!mongoose.Types.ObjectId.isValid(id)) return {
            success: false,
            statusCode: 400,
            message: "Invalid ID."
        }

        const userUpdated = await User.findById(id);
        const errors = {}
        let updates = {}

        if(!userUpdated) return {
            success: false,
            statusCode: 404,
            message: "User not found."
        }

        if((requester.type != "user" || requester.type != "supervisor" || requester.type != "technical") && !requesterId) return {
            success: false,
            statusCode: 403,
            message: "Invalid requester type."
        }

        if(requester.type === "user" && id !== requesterId) return {
            success: false,
            statusCode: 403,
            message: "Invalid request"
        }

        const permission = {
            "type": {
                supervisor: ['name', 'email', 'password', 'type'], technical: ['name', 'email', 'password', 'type'],
                user: ['name', 'email', 'password']
            }
        }

        const allowedFields = permission.type[requester.type] || permission.type.user

        validateFields(data, allowedFields, updates)

        validateUserData(updates, userSchema, errors)
        if(Object.keys(errors).length > 0) return {
            success: false,
            statusCode: 422,
            message: errors
        }

        updates = filterUpdates(updates, userUpdated)

        if(Object.keys(updates).length == 0) return {
            success: true,
            statusCode: 200,
            message: "Nenhum dado foi atualizado."
        }

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updates },
            { returnDocument: 'after', runValidators: true }
        )
        return { user, success: true, statusCode: 204, message: "Updated." }
    }

    // RETORNAR ERROS AO CONTROLLER
    async login(data){
        let details = {}
        const { email, password } = data
        let userObj = await User.findOne({ email: email })

        const pwMatch = await userObj.comparePassword(password)

        if(!pwMatch || !userObj) return {
            success: false,
            status: 401,
            message: "The passwords doesn't match."
        }

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

    async delete(userId, requesterId){
        const user = await User.findById(userId)
        if(!user) return {
            success: false,
            statusCode: 404,
            message: "User not found."
        }

        const requester = await User.findById(requesterId)
        if(!requester) return {
            success: false,
            statusCode: 403,
            message: "Forbidden."
        }

        if(requesterId == userId) return {
            success: false,
            statusCode: 403,
            message: "Forbidden."
        }

        if(requester.type != "supervisor" && requester.type != "technical") return {
            success: false,
            statusCode: 403,
            message: "Forbidden."
        }

        await User.findByIdAndDelete(userId)

        return { success: true, statusCode: 200, message: "User succefully deleted."}
    }
}

module.exports = new UserService();