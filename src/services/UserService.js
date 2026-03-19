const bcrypt = require('bcryptjs')
const { User } = require('../models/schema')

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

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
                name,
                email,
                password: hashedPassword,
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
        }).select('-password -__v -_id') // remove a senha para retornar
        console.log("users: " + users)
        return users
    }
}

module.exports = new UserService();