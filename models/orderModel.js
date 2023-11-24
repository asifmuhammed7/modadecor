const mongoose = require('mongoose');

const OrderModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    products: [{    
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },      
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    address:{
        type: String,
        required: true
    },

    createdOn: {
        type: Date,
        default: Date.now
    }, 
    paymentMethod:{
        type: String,
        required: true
    },
    orderStatus: {
        type: String,
        default:'Placed'
        
    },
    total: {
        type: Number,
        
    },
    discountedPrice: {
        type: Number,
        default: 0
    },
    grandTotal: {
        type: Number
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    }
});

module.exports = mongoose.model('Orders', OrderModel);