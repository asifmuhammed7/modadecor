const Coupon = require('../models/couponModel')
const couponCode = require('coupon-code')


const addCoupon = async(req,res)=>{
    try{


        const code = couponCode.generate({parts:1,partLen:8})
        const today = new Date()

        const validityString = req.body.validity;
    const numericValidity = parseInt(validityString, 10);
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + numericValidity);

    console.log(expirationDate)
    const newCoupon = new Coupon({
        code: code,
        discountPercentage: req.body.discountPercent,
        name: req.body.name,
        expireDate: expirationDate,
        minPurchase: req.body.minPurchase,
        maxDiscountValue: req.body.maxDiscountValue,
      });

      const savedCoupon = await newCoupon.save();

    if (savedCoupon) {
      res.redirect('/admin/coupon');
    }

    }
    catch(error){
        console.log(error.message)
    }
}

module.exports ={
    addCoupon
}