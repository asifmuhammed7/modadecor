const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    name:{
        type:String
    },
    createdDate:{
        type:Date,
        default: new Date()
    },
    expireDate:{
        type:Date,

    },
    minPurchase:{
        type:Number
    },
    maxDiscountValue:{
        type:Number
    },
    user:[ {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

})


module.exports = mongoose.model('Coupon',couponSchema)