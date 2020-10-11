const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const refreshConfigSchema = new Schema({
    email : {
        type: String,
        required: true,
        lowercase: true,
        match: [emailRegex, 'email format is invalid']
    },
    _id : {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    token : {
        refreshToken: {
            type: String,
            required: true
        },
        expiresIn : {
            type : Date,
            index : {expires: '1m'}
        }
    }
}, {timestamps: true});

const RefreshConfig = mongoose.model('RefreshConfig', refreshConfigSchema);
module.exports = RefreshConfig;