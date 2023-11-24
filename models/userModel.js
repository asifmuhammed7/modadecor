const mongoose = require('mongoose')
const userModel = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Products',
                required: true
            }
            ,
        
            quantity: {
                type:Number,
                required:true,
                default:1
            }
        }
    ]
    ,
    isAdmin:{
        type:Number,
        default:0
    },
    isActive:{
        type:Boolean,
        default:true
    },
    address:[{
        name:{
            type:String,
            required: true
        },
        address:{
            type:String,
            required:true
        },
        district:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },phone:{
            type:Number,
            required:true
        },isDelete:{
            type:Boolean,
            default:false
        }
    }
    ],
    profileImage: {
        type: String
    },
    wishlist:{
        type:Array
    },
    Wallet:{
        type:Number,
        default:0
    },
    transactions: [{
        type: {
            type: String
        },
        amount: {
            type: Number,
        },
        date: {
            type: Date
        }
    }]
    
    
})
module.exports = mongoose.model('User',userModel)
