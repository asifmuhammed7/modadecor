const mongoose = require('mongoose')

const productModel = new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    salePrice:{
        type:Number,
        required:true
    },
    regularPrice:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
    },
    quantity:{
        type:Number
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    description:{
        type:String,
        required: true
    },
    isDelete:{
        type:Boolean,
        default:false
    },
    brandName:{
        type:String,
        required:true
    }
})
module.exports = mongoose.model('Products',productModel)