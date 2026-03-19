import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

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
            const userExists = await prisma.user.findUnique({where: {email}})
            if(userExists) errors.email_err = "User already exists."
        }

        if(Object.keys(errors) > 0){
            // Instancia um erro com uma mensagem e os erros dos campos
            const error = new Error("Validation failed.")
            error.details = errors
            throw error
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    type
                }
            })

            const { password: _, ...userWithoutPassword } = user
            return userWithoutPassword
    }
}

module.exports = new UserService()