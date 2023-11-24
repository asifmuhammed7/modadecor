const express =require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const logger = require('morgan')
const nocache =require('nocache')
const userRouter = express()
const config = require('../config/config')

const auth = require('../middleware/userAuth')
const userController = require('../controllers/userController')
const cartControlller = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const upload = require('../middleware/multer')
const block = require('../middleware/block')
const cartCheck = require('../middleware/cartCheck')
userRouter.use(nocache())
userRouter.use(session({
    secret:config.sessionSecretId,
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:3600000}
}))
userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({extended:true}))

userRouter.set('view engine','ejs')
userRouter.set('views','./views/user')
userRouter.use(logger('dev'))


userRouter.get('/register',auth.isLogout,userController.loadregister)
userRouter.post('/register',userController.sendOtp)
userRouter.get('/otp',userController.otpVerify)
userRouter.post('/otp',userController.verified)
userRouter.get('/otp',userController.loadOtp)
userRouter.post('/verify',userController.verified)
userRouter.get('/',userController.loadHome1)

userRouter.get('/logout',userController.userLogout)
userRouter.get('/login',auth.isLogout,userController.loadLogin)
userRouter.post('/login',auth.isLogout,userController.verifyUser)

userRouter.get('/home',userController.loadHome)
userRouter.get('/shop',userController.loadShop)
userRouter.get('/productDetails',userController.loadProductDetails)

userRouter.get('/cart',auth.isLogin,block.validateUser,cartControlller.loadCart)
userRouter.post('/addToCart', auth.isLogin,block.validateUser, cartControlller.addToCart);
userRouter.get('/updateCart',auth.isLogin,block.validateUser,cartControlller.updateCartt)
userRouter.post('/removeItem/:productId',auth.isLogin,block.validateUser,cartControlller.deleteCart)
userRouter.get('/userProfile',auth.isLogin,block.validateUser,userController.userProfile)
userRouter.post('/checkout',auth.isLogin,block.validateUser,cartCheck.cartValid1, orderController.loadCheckout)
userRouter.get('/download-invoice/:orderId', auth.isLogin,block.validateUser, orderController.loadInvoice)
userRouter.post('/updateUser', auth.isLogin, block.validateUser, upload.profileImageUpload, userController.loadAccount);
userRouter.get('/myAddress',auth.isLogin,block.validateUser,userController.loadAddress)
userRouter.get('/editAddress',auth.isLogin,block.validateUser,userController.loadEditAddress)
userRouter.post('/updateAddress/:id',auth.isLogin,block.validateUser,userController.updateAddress)
userRouter.post('/deleteAddress/:id',auth.isLogin,block.validateUser,userController.deleteAddress)
userRouter.get('/addAddress',auth.isLogin,block.validateUser,orderController.loadNewAddress)
userRouter.post('/addAddress',auth.isLogin,block.validateUser,orderController.addAddress)
userRouter.get('/createAddress',auth.isLogin,block.validateUser,orderController.loadAddAddress)
userRouter.post('/createAddress',auth.isLogin,block.validateUser,orderController.createAddress)

userRouter.get('/wishlist',auth.isLogin,block.validateUser,userController.loadWishlist)
userRouter.get('/AddToWishlist',auth.isLogin,block.validateUser,userController.AddToWishlist)
userRouter.delete('/removeFromWishlist/:itemId',auth.isLogin,block.validateUser,userController.deleteWish)
userRouter.get('/getCartItems',auth.isLogin,block.validateUser,cartCheck.cartValid,orderController.getCartItem)
userRouter.post('/placeOrder',auth.isLogin,block.validateUser,cartCheck.cartValid1,orderController.placeOrder)
userRouter.get('/orderSuccess',auth.isLogin,block.validateUser,orderController.loadSuccess)
userRouter.get('/orders',auth.isLogin,block.validateUser,orderController.loadOrder)
userRouter.get('/orderDet',auth.isLogin,block.validateUser,orderController.orderDetail)
userRouter.post('/updateOrder',auth.isLogin,block.validateUser,orderController.cancelOrder)
userRouter.get('/search',userController.searchProducts)
userRouter.post('/returnOrder',auth.isLogin,block.validateUser,orderController.returnOrder)
userRouter.post('/applyCoupon/:couponId',auth.isLogin,block.validateUser,orderController.applyCoupon)
userRouter.get('/selectCoupon/:couponId', auth.isLogin,block.validateUser,orderController.selectCoupon);

userRouter.get('/wallet',auth.isLogin,block.validateUser,userController.loadWallet)

userRouter.post('/verifyPayment',auth.isLogin,block.validateUser,orderController.verifyPayment)
userRouter.get('/paymentFailed',auth.isLogin,block.validateUser,orderController.paymentFailed )

userRouter.get('/orderSuccess1',orderController.loadOrderSuccess1)

module.exports = userRouter