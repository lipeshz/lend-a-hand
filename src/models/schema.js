const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: { type: String, default: 'Final User'}
}) 

const User = mongoose.model('User', UserSchema)

module.exports = { User }