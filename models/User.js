const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
    name : {
        type: String
    },
    email : {
        type: String,
        required: true,
        lowercase: true,
        match: [emailRegex, 'Invalid email format']
    },
    phone : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    refreshConfigId : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {timestamps: true});

const User = mongoose.model('User', userSchema);
module.exports = User;