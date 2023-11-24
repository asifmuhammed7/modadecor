const User = require('../models/userModel')

const validateUser = async (req,res,next)=>{
   try{

        const userId = req.session.user_id
        const user = await User.findById(userId)

        if(user.isActive){
            next()
        }else{
            req.session.user_id = null
            console.log('fghfhkhkjsd');
            res.redirect('/login')
        }
   }catch(error){
    console.log(error.message);
   }
}
module.exports ={
    validateUser
}