const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: true },
    type: { type: String, default: 'user', enum: ['user', 'technical', 'supervisor']}
}) 

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    
    try{
        this.password = await bcrypt.hash(this.password, 10)
    }catch(error){
        throw error
    }
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const ticketSchema = new mongoose.Schema({
    title: { type: String, required: true, maxLength: 60 },
    desc: { type: String, required: true, maxLength: 200},
    urgency: { type: String, required: true, enum: ['very urgent', 'urgent', 'non urgent'] },
    category: { type: String, required: true, enum: ['hardware', 'software', 'conectivity'] },
    image: { type: String, required: false },
    status: { type: String, required: true, enum: ['open', 'pending', 'in service', 'closed', 'solved'] },
    openDate: { type: Date, required: true },
    closeDate: { type: Date, required: false },
    creator: { type: String, required: true },
    technical: { type: String, required: false },
    solution: { type: String, required: false, maxLength: 500 }
})

const User = mongoose.model('User', userSchema)
const Ticket = mongoose.model('Ticket', ticketSchema)

module.exports = { User, Ticket }