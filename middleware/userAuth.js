const isLogin = async (req,res,next)=>{
    try{
        if(req.session.user_id){
            console.log('login')
            next()
        }else{
            res.redirect('/login')
        }
    }
    catch(error){
        console.log(error);
    }
}

const isLogout =async(req,res,next)=>{
    try{
        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next()
        }
    }catch(error){
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}