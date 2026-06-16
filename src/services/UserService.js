const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const { User } = require('../models/schema')
const { schemaValidation, removeUndefinedFields, filterUpdates } = require('../utils/validateFields')
const { userSchema }  = require('../utils/modelSchema')
const CacheService = require('../services/CacheService')
const filterFields = require('../utils/filterFields')
const { loggingMessageConstructor } = require('../utils/logFile')
const { ROLES, USER_RULES } = require('../utils/permissions')
class UserService{
    async store(data, requester) {
        if(!USER_RULES.CREATE_USER.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to create a new user.", { requester }, "CREATE")
        }

        let errors = {}
        errors = schemaValidation(data, userSchema)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        const { name, email, password, conf_password, type } = data
        const userExists = await User.findOne({email: data.email})

        // Verifica se o usuário existe (para não ficar fazendo requisições a toa)
        if(userExists) return {
            success: false,
            error: "USER_ALREADY_EXISTS",
        }

        try{
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

            return { 
                success: true, 
                data: user,
                log: loggingMessageConstructor("User created succefully.", { requester, target: user }, "CREATE")
            };
        }catch(error){
            if(error.code == 11000) return {
                success: false,
                error: "USER_ALREADY_EXISTS",
                log: loggingMessageConstructor(error.message, { }, "USER: STORE")
            }

            return {
                success: false,
                error: "INTERNAL_SERVER_ERROR",
                log: loggingMessageConstructor(error.message, { }, "USER: STORE")
            }
        }
    }

    async index(filters, requester){
        if(!USER_RULES.VIEW_ALL_USERS.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to view other users.", { requester, filter: JSON.stringify(filters) }, "INDEX")
        }

        // Filtro os dados vindos dos header
        const data = filterFields(filters)
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find(data).select('-password').lean() // remove a senha para retornar

        return {
            success: true,
            data: users
        }

        // return { users, success: true, statusCode: 200, message: "Success."}
    }

    async show(userId, requester){
        if(!mongoose.Types.ObjectId.isValid(userId)) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("The ID format is invalid.", { requester, target: userId}, "UPDATE")
        }

        const isOwner = String(userId) === String(requester.id)

        if(!isOwner && !USER_RULES.VIEW_ALL_USERS.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to access this data.", { requester, target: userId }, "SHOW")
        }

        const user = await User.findById(userId).select('name email type').lean()

        if(!user) return {
            success: false,
            error: "NOT_FOUND"
        }

        return { 
            success: true,  
            data: user 
        }
    }

    async update(userId, data, requester){
        const { name, email, password, type } = data

        if(!mongoose.Types.ObjectId.isValid(userId)) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("The ID format is invalid.", { requester, target: userId}, "UPDATE")
        }

        const isOwner = String(userId) === String(requester.id)

        if(!isOwner && !USER_RULES.UPDATE_USER.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to access this data.", { requester, target: userId}, "UPDATE")
        }

        let updates = removeUndefinedFields({ ...data})
        if(updates.type !== undefined && !USER_RULES.CHANGE_ROLE.includes(requester.type) ) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("Privilege escalation attempt.", { requester }, "UPDATE")
        }

        let errors = {}

        const userUpdated = await User.findById(userId)

        if(!userUpdated) return {
            success: false,
            error: "NOT_FOUND"
        }

        const userUpdateLog = userUpdated.toObject()
        delete userUpdateLog.password

        errors = schemaValidation(updates, userSchema)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        updates = filterUpdates(updates, userUpdated)

        if(Object.keys(updates).length == 0){
            const user = userUpdated.toObject()
            delete user.password
            return {
                success: true,
                data: user
            }
        }

        try{
            userUpdated.set(updates)
        
            await userUpdated.save()
            const user = userUpdated.toObject()
            delete user.password
            delete user.__v

            return { 
                success: true, 
                data: user,
                log: loggingMessageConstructor("Success to update user data.", { requester, userUpdateLog, target: user, updated: Object.keys(updates) }, "UPDATE")
            }
        }catch(error){
            console.log(error)
            if(error.code == 11000) return {
                success: false,
                error: "USER_ALREADY_EXISTS"
            }

            return {
                success: false,
                error: "INTERNAL_SERVER_ERROR"
            }
        }
    }

    // RETORNAR ERROS AO CONTROLLER
    async login(data){
        let details = {}
        const { email, password } = data
        let userObj = await User.findOne({ email: email })

        if(!userObj) return {
            success: false,
            error: "UNAUTHORIZED",
            labels: "E-mail or password are incorrect."
        }

        const pwMatch = await userObj.comparePassword(password)

        if(!pwMatch) return {
            success: false,
            error: "UNAUTHORIZED",
            labels: "E-mail or password are incorrect."
        }

        const token = jwt.sign(
            {_id: userObj._id, email: userObj.email, type: userObj.type},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        const user = userObj.toObject()
        delete user.password;
        delete user.__v;

        return {
            success: true,
            data: user,
            token
        }
    }

    async logout(token) {

        if(!token) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("Invalid token to logout.", { token: "MISSING" }, "USER: LOGOUT")
        }

        const block = await CacheService.blockToken(token)

        return {
            success: true,
        }
    }

    async delete(userId, requester){

        if(!mongoose.Types.ObjectId.isValid(userId)) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("The ID format is invalid.", { requester, target: userId}, "DELETE")
        }

        const isOwner = String(requester.id) === String(userId)

        if(isOwner || !USER_RULES.DELETE_USER.includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to delete this data.", { requester, target: userId}, "DELETE")
        }

        const user = await User.findByIdAndDelete(userId).lean()
        if(!user) return {
            success: false,
            error: "NOT_FOUND",
        }

        delete user.password
        delete user.__v

        return { 
            success: true,
            log: loggingMessageConstructor("User deleted with success.", { requester, target: user}, "DELETE")
        }
    }
}

module.exports = new UserService();