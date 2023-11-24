const express = require('express')
const session = require('express-session')
const bodyParser =require('body-parser')
const nocache = require('nocache')
const logger = require('morgan')
const upload = require('../middleware/multer')
const adminRouter = express()

const config = require('../config/config')
adminRouter.use(nocache())
adminRouter.use(session({
    secret: config.sessionSecretId,
    resave: false,
    saveUninitialized: true 
}));

adminRouter.use(logger('dev'))
adminRouter.set('view engine','ejs')
adminRouter.set('views','./views/admin')

adminRouter.use(bodyParser.json());
adminRouter.use(bodyParser.urlencoded({extended:true}))

const auth = require('../middleware/adminAuth')
const adminController = require('../controllers/adminController')
const productController = require('../controllers/productController')
const categoryController = require('../controllers/categoryController')
const adminUserController = require('../controllers/adminUserController')
const couponController = require('../controllers/couponController')

adminRouter.get('/',auth.isLogout,adminController.loadLogin)
adminRouter.post('/',adminController.verifyUser)
adminRouter.get('/dashboard',auth.isLogin, adminController.loadDashboard)
adminRouter.get('/category',categoryController.loadCategory)
adminRouter.post('/category',categoryController.loadNewCategory)
// adminRouter.get('/categorydelete',auth.isLogin,categoryController.loadDeleteCategory)
adminRouter.post('/deleteCategory',auth.isLogin,categoryController.deleteCategory)
adminRouter.get('/categoryedit',auth.isLogin,categoryController.loadEditCategory)
adminRouter.post('/updateCategory',auth.isLogin,categoryController.updateCategory)
adminRouter.get('/users',auth.isLogin,adminUserController.loadUsers)
adminRouter.post('/toggle',auth.isLogin,adminUserController.toggleController)
adminRouter.get('/products',auth.isLogin,productController.loadProducts)
adminRouter.get('/addproduct',auth.isLogin,productController.loadAddProducts)
adminRouter.post('/newProduct', upload.productImageUpload, productController.addProducts);
adminRouter.get('/editProduct/:id',auth.isLogin,productController.loadEditProducts)
adminRouter.post('/updateProduct/:id',auth.isLogin,upload.productImageUpload,productController.updateProducts)
adminRouter.post('/deleteProduct', auth.isLogin, productController.deleteProducts);
adminRouter.get('/logout',auth.isLogin,adminController.adminLogout)

adminRouter.get('/order',auth.isLogin,adminController.loadOrder)
adminRouter.get('/orderDetail/:id',auth.isLogin,adminController.loadorderDetail)
adminRouter.post('/updateOrderStatus/:orderId',auth.isLogin,adminController.orderStatus)

adminRouter.get('/coupon',auth.isLogin,adminController.loadCoupon)

adminRouter.get('/addCoupon',auth.isLogin,adminController.addCoupon)

adminRouter.post('/addCoupon',auth.isLogin,couponController.addCoupon)

adminRouter.get('/banner',auth.isLogin,adminController.loadBanner)
adminRouter.get('/addBanner',auth.isLogin,adminController.loadAddBanner)
adminRouter.post('/bannerIsActive', auth.isLogin,adminController.bannerIsActive)
adminRouter.post('/addBanner',auth.isLogin,upload.bannerImageUpload, adminController.addBanner)

adminRouter.get('/salesReport',auth.isLogin,adminController.loadReport)
adminRouter.get('/reportUpdate',auth.isLogin,adminController.salesReport)

module.exports = adminRouter