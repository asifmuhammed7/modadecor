const User = require('../models/userModel')




const cartValid = async(req,res,next)=>{
    try{
        const userId = req.session.user_id
        const user = await User.findById(userId);

        if(user.cart.length === 0){
        
            res.json({cartChange: true});
        } else {
            
            next();
        }
        

    }catch(error){

    }
}


const cartValid1 = async(req, res, next) => {

    try {

        const userId = req.session.user_id;
        const user = await User.findById(userId);

        if(user.cart.length === 0){
            console.log("kkkk");
            res.redirect('/cart')
        } else {
            console.log("hlello");
            next();
        }
        
    } catch (error) {
        console.log(error.message)
    }
}

module.exports ={
    cartValid,
    cartValid1
}