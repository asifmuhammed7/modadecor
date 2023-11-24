const Admin =require('../models/adminModel')
const User =require('../models/userModel')
const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const Order = require('../models/orderModel')
const Coupon = require('../models/couponModel')
const bcrypt =require('bcrypt')
const Banner = require('../models/bannerModel')
const loadLogin = async(req,res)=>{
    try {
        
        res.render('login',{message:''});
    }
    catch (error){
        console.log(error.message);
    }
}
const adminLogout = async (req, res) => {

    try {

        req.session.admin_id = null;
        res.redirect('/admin');
        
    } catch (error) {
        console.log(error.message);
    }
}
const verifyUser =async(req,res)=>{
    try{
        const email =req.body.email;
        const password = req.body.password

        const adminData = await Admin.findOne({email:email})

        console.log(email, password)
        console.log(adminData)

        // In verifyUser function, set the correct session variable
if (adminData) {
    if (adminData.password === password) {
        if (adminData.isAdmin === 0) {
            res.render('login', { message: 'Invalid Admin' });
        } else {
            // Use the correct session variable name
            req.session.admin_id = adminData._id;
            res.redirect('/admin/dashboard');
        }
    } else {
        res.render('login', { message: 'Invalid Admin' });
    }
} else {
    res.render('login', { message: 'Invalid Admin' });
}

    }catch(error){
        console.log(error.message);
    }
}
const loadDashboard = async(req,res)=>{
    try {

        const orders = await Order.find({orderStatus:'Delivered'})
        let totalRevenue = 0

        for(const order of orders){
            totalRevenue += order.grandTotal
        }

        const deliveredOrdersCount = await Order.countDocuments({ orderStatus: 'Delivered' });

        const deliveredOrders = await Order.find({ orderStatus: 'Delivered' }).populate({
            path: 'products.product',
            model: 'Products',
        });

        let totalProductCount = 0;
        for (const order of deliveredOrders) {
            totalProductCount += order.products.reduce((total, product) => total + product.quantity, 0);
        }


        const monthlyEarning1 = (totalRevenue * 35) / 100;
        const monthlyEarning = monthlyEarning1.toLocaleString(); 

        const revenue = totalRevenue.toLocaleString();

        
        res.render('dashboard',{message:'',revenue:revenue,totalProduct:totalProductCount,orders:deliveredOrdersCount,monthlyEarning});
    }
    catch (error){
        console.log(error.message);
    }
}


const loadProducts = async(req,res)=>{
    try{
        res.render('products',{message:''})
    }
    catch (error){
        console.log(error.message);
    }
}
const loadOrder = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;
        const totalCount = await Order.countDocuments();
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const orders = await Order.find()
            .sort({ createdOn: -1 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .populate({
                path: 'products.product',
                model: 'Products',
            })
            .populate('user', 'name email');

        res.render('order', { orders: orders, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const loadorderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Products',
            })
            .populate('user', 'name email address');

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const user = await User.findOne({ _id: order.user });

        const chosenAddressId = order.address; 

        let chosenAddress;
        if (user && user.address) {
            chosenAddress = user.address.find((address) => address._id.toString() === chosenAddressId);
        }

        res.render('orderDetail', { order: order, chosenAddress: chosenAddress }); // Pass the chosenAddress to the rendering template
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};



const orderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const newStatus = req.body.status;
        const order = await Order.findById(orderId)
        const existingOrder = await Order.findById(orderId);
        const userId = existingOrder.user
        const user = await User.findById(userId)
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (existingOrder && existingOrder.orderStatus === 'Delivered') {
            return res.status(400).json({ error: 'Cannot change the status of a Delivered order' });
        }

        let updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { orderStatus: newStatus },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (newStatus === 'Return Pending') {
            for (const product of updatedOrder.products) {
                const existingProduct = await Product.findById(product.productId);
                if (existingProduct) {
                    existingProduct.quantity += product.quantity;
                    await existingProduct.save();
                }
            }

            await Promise.all([
                updatedOrder.save(),
                ...updatedOrder.products.map(async (product) => {
                    await Product.findById(product.productId).save();
                })
            ]);
        }
        if(newStatus==='Return'){
            for (const product of updatedOrder.products) {
                const { product: productId, quantity } = product;
                await Product.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { quantity: quantity } }, // Increment the stock by the canceled quantity
                    { new: true }
                );
            }
            console.log("return", order.grandTotal)
            console.log("wallet",user.Wallet)
            user.Wallet += order.grandTotal;
            user.transactions.push({
                type: 'credit',
                amount: order.grandTotal,
                date: new Date()
            });

            await user.save();
        }

        res.json({ message: 'Order status updated successfully', updatedOrder: { orderStatus: newStatus } });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Error updating order status' });
    }
};

const loadCoupon = async (req,res)=>{
    try{
        const coupons = await Coupon.find()
        res.render('coupon',{coupons})

    }
    catch(error){
        console.log(error.message);
    }
}
const addCoupon = async (req,res)=>{
    try{
        res.render('addCoupon')
    }
    catch(error){
        console.log(error.message);
    }
}

const loadBanner = async (req,res)=>{
    try{
        const banners = await Banner.find()

        res.render('banner',{banners})
    }
    catch(error){
        console.log(error.message);
    }
}

const loadAddBanner = async (req,res)=>{
    try{
       res.render('addBanner') 
    }
    catch(error){
        console.log(error.message)
    }
}

const addBanner = async(req,res)=>{
    try{

        const img = req.files.map((file) => file.filename);

        const banner = new Banner ({
            title : req.body.bannerTitle,
            description: req.body.bannerDescription,
            image :img,
            createdAt: new Date()
        })

        await banner.save()
        res.redirect('/admin/banner')
    }catch(error){
        console.log(error.message)
    }
}
const bannerIsActive = async (req, res) => {
    try {
        const { id } = req.body;
        const banner = await Banner.findById(id);

        console.log(banner,'banmyuy');

        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found.' });
        }

        banner.isActive = !banner.isActive;
        await banner.save();

        res.json({ success: true, message: 'Banner status toggled successfully.', banner });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
};

const loadReport = async (req,res)=>{
    
        try {
          
          const orderData = await Order.find({orderStatus: {
            $in: ["Delivered", "Return"]
        }});
      
          const totalRevenue = orderData.reduce((total, order) => total + (order.grandTotal || 0), 0);
      
          res.render('salesReport', { orders: orderData, totalRevenue });
        } catch (error) {
          res.status(500).json({ error: 'Internal Server Error' });
        }
      
}

const salesReport = async (req, res) => {
    try {
        const type = req.query.type;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let dateRange;
        if (type === 'weekly') {
            const endOfWeek = new Date();
            const startOfWeek = new Date(endOfWeek);
            startOfWeek.setDate(endOfWeek.getDate() - 6); // Go back 6 days to the start of the week
            dateRange = { $gte: startOfWeek, $lte: endOfWeek };
        } else if (type === 'monthly') {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            dateRange = { $gte: startOfMonth, $lte: endOfMonth };
        } else if (type === 'yearly') {
            const today = new Date();
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            const endOfYear = new Date(today.getFullYear(), 12, 0);
            dateRange = { $gte: startOfYear, $lte: endOfYear };
        } else if (type === 'custom') {
            const startCustom = startDate ? new Date(startDate) : new Date(0);
            const endCustom = endDate ? new Date(endDate) : new Date();

            dateRange = { $gte: startCustom, $lte: endCustom };
        } else {
            return res.status(400).json({ error: 'Invalid sales report type' });
        }
        console.log(dateRange);
        const orderData = await Order.find({
            createdOn: dateRange,
            orderStatus: { $in: ['Delivered', 'Return'] },
        });
        const totalRevenue = orderData.reduce((total, order) => total + (order.grandTotal || 0), 0);

        res.json({ orderData, totalRevenue });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports ={
    loadLogin,
    verifyUser,
    loadDashboard,
    loadProducts,
    adminLogout,
    loadOrder,
    loadorderDetail,
    orderStatus,
    loadCoupon,
    addCoupon,
    loadBanner,
    loadAddBanner,
    addBanner,
    bannerIsActive,
    loadReport,
    salesReport
}