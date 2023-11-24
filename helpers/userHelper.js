const User = require('../models/userModel')
const Product = require ('../models/productModel')
const Order = require('../models/orderModel')
const Razorpay = require('razorpay');
const crypto = require('crypto')
require('dotenv').config()

let instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const generateRazorpay = (orderId, total) => {
    return new Promise((resolve, reject) => {

        console.log(total * 100);
        let options = {
            amount: total * 100,
            currency: 'INR',
            receipt: orderId
        };

        instance.orders.create(options, function (err, order) {
            console.log('hiiiii',order);
            if (err) {
                console.log(err,'hh')
            } else {
                resolve(order)
            }

        })

    })
}

const verifyPayment = (details) => {
    console.log(details)
    return new Promise((resolve, reject) => {
        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'cOxEEz1hkQqqBI6aL3B9KC9n')

        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
        hmac = hmac.digest('hex')

        if (hmac == details.payment.razorpay_signature) {
            console.log("success");
            resolve();
        } else {
            console.log("Failed");
            reject();
        }

    })
}

const changePaymentStatus = (orderId) => {
    return new Promise((resolve, reject) => {
        console.log(orderId);
        console.log(orderId);

        Order.updateOne({ _id: orderId },
            {
                $set: {
                    orderStatus: "Pending",
                    paymentStatus: "Paid"
                }
            }).then(() => {
                console.log("changed");
                resolve();
            })
    })
}

module.exports ={
    generateRazorpay,
    verifyPayment,
    changePaymentStatus,

}