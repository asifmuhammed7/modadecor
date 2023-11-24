const mongoose = require("mongoose");

const adminModel = new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Number,
        default:1
    }
})

module.exports = mongoose.model('Admin',adminModel)