const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')
const { User } = require('../models/schema')
const { validateUserData, validateFields, filterUpdates } = require('../utils/validateFields')
const userSchema = require('../utils/modelSchema')
const filterFields = require('../utils/filterFields')
const { loggingMessageConstructor } = require('../utils/logFile')

class UserService{
    async store(data, requester) {
        if(!["supervisor", "technical"].includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to create a new user.", { requester }, "CREATE")
        }

        const errors = {}
        validateUserData(data, userSchema, errors)

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
    }

    async index(filters, requester){
        if(requester.type != "supervisor" && requester.type != "technical") return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to view other users.", { requester, filter: JSON.stringify(filters) }, "INDEX")
        }

        // Filtro os dados vindos dos header
        const data = filterFields(filters)
        // Retorna os usuários do banco de acordo com a regex
        const users = await User.find(data).select('name email type').lean() // remove a senha para retornar

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

        if(String(userId) != String(requester.id) && !["supervisor", "technical"].includes(requester.type)) return {
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

        if(String(userId) !== String(requester.id) && !["supervisor", "technical"].includes(requester.type)) return {
            success: false,
            error: "FORBIDDEN",
            log: loggingMessageConstructor("The requester doesn't have permission to access this data.", { requester, target: userId}, "UPDATE")
        }

        if(!["supervisor", "technical"].includes(requester.type) && data.type != undefined) return {
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
        delete userUpdateLog.__v

        let updates = validateFields(data)

        errors = validateUserData(updates, userSchema, errors)

        if(Object.keys(errors).length > 0) return {
            success: false,
            error: "UNPROCESSABLE_CONTENT",
            labels: errors
        }

        updates = filterUpdates(updates, userUpdated)

        
        if(Object.keys(updates).length == 0) return {
            success: true,
            data: userUpdated
        }

        userUpdated.set(updates)
        
        await userUpdated.save()
        const user = userUpdated.toObject()
        delete user.password

        return { 
            success: true, 
            data: user,
            log: loggingMessageConstructor("Success to update user data.", { requester, userUpdateLog, target: user, updated: Object.keys(updates) }, "UPDATE")
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
            {id: userObj.id, email: userObj.email, type: userObj.type},
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

    async delete(userId, requester){

        if(!mongoose.Types.ObjectId.isValid(userId)) return {
            success: false,
            error: "BAD_REQUEST",
            log: loggingMessageConstructor("The ID format is invalid.", { requester, target: userId}, "DELETE")
        }

        if(String(requester.id) == String(userId) || !["supervisor", "technical"].includes(requester.type)) return {
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