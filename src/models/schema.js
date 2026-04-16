const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    type: { type: String, default: 'user', enum: ['user', 'technical', 'supervisor']}
}) 

UserSchema.pre('save', async function(){
    if(!this.isModified('password')) return
    
    try{
        this.password = await bcrypt.hash(this.password, 10)
    }catch(error){
        throw error
    }
})

UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', UserSchema)

module.exports = { User }