const mongoose = require('mongoose')

const categoryModel = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDelete :{
        type:Boolean,
        default:false
    }

})

module.exports = mongoose.model('Category',categoryModel)