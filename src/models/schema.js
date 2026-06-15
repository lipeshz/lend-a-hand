const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, max: 50},
    email: { type: String, required: true, unique: true, max: 50 },
    password: { type: String, required: true, select: true },
    type: { type: String, default: 'user', enum: ['user', 'technical', 'supervisor']}
}, { optimisticConcurrency: true }) 

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
    title: { type: String, required: true, min: 10, max: 60 },
    desc: { type: String, required: true, max: 200},
    urgency: { type: String, required: true, enum: ['very urgent', 'urgent', 'non urgent'] },
    category: { type: String, required: true, enum: ['hardware', 'software', 'conectivity'] },
    image: { type: String, required: false },
    status: { type: String, required: true, enum: ['open', 'pending', 'in service', 'closed', 'solved'] },
    openDate: { type: Date, required: true },
    closeDate: { type: Date, required: false },
    creator: { type: String, required: true },
    technical: { type: String, required: false },
    solution: { type: String, required: false, max: 500 }
}, { optimisticConcurrency: true })

const User = mongoose.model('User', userSchema)
const Ticket = mongoose.model('Ticket', ticketSchema)

module.exports = { User, Ticket }