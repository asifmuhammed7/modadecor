const Orders = require('../models/orderModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const userHelper = require('../helpers/userHelper')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const easyInvoice = require('easyinvoice')
const puppeteer = require('puppeteer');
const ejs = require('ejs');

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id
        const total = req.query.total
        console.log(`${total} total`)
        const user = await User.findById(userId).populate('cart.product')
        const addresses = await user.address.filter(address => !address.isDelete);

        req.session.checkoutPageUrl = req.originalUrl;


    

        const currentDate = new Date();

        const validCoupons = await Coupon.find({

            expireDate: { $gte: currentDate },
            user: { $nin: [userId] },
        });

        const couponsGreaterThanTotal = validCoupons.filter(coupon => coupon.minPurchase <= total);

        console.log('coupons' + validCoupons);

        res.render('checkout', { cart: user.cart, addresses: addresses, user: user, coupons: couponsGreaterThanTotal,subTotal:total })
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadAddAddress = async (req, res) => {
    try {

        const userId = req.session.user_id
        const user = await User.findById(userId)

        res.render('address', { user: user })
    }
    catch (error) {
        console.log(error.message);
    }
}
const addAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);
        const addressData = req.body;
        user.address.push(addressData);
        await user.save();
        res.status(201).json({ success: true, newAddress: addressData });
    } catch (error) {
        console.error('Error creating address:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
const createAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId).populate('cart.product')

        const addressData = req.body
        user.address.push(addressData)
        await user.save()
        res.redirect('/myAddress')
    }
    catch (error) {
        console.log(error.message);
    }
}

const loadNewAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId).populate('cart.product')

        
        res.render('newAddress',{user})
    }
    catch (error) {
        console.log(error.message);
    }
}


const getCartItem = async (re, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('cart');
        const cartItems = user.cart;
        res.status(200).json(cartItems);
    } catch (error) {
        console.error('Error while fetching cart items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

const selectCoupon = async (req, res) => {
    try {

        const couponId = req.params.couponId;

        const coupon = await Coupon.findById(couponId);

        res.json(coupon);

    } catch (error) {

    }
}

const applyCoupon = async (req, res) => {
    try {
        const couponId = req.params.couponId;

        const coupon = await Coupon.findById(couponId);

        // Check if the coupon is not found
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const subTotal = parseInt(req.query.subTotal);

        let discount = subTotal * (coupon.discountPercentage / 100);

        if (discount > coupon.maxDiscountValue) {
            discount = coupon.maxDiscountValue;
        }

        const discountedPrice = subTotal - discount;

        // Calculate the changed subtotal after applying the coupon
        const changedSubtotal = discountedPrice;

        res.json({ success: true, discountedPrice, discount, changedSubtotal });

    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id

        const userCart = await User.findById(userId)
        if (userCart.cart.length === 0) {
            console.log('empty cart' + userCart.cart)
            res.json({ cartChange: true })
        }
        const {

            selectedAddressId,
            paymentMethod,
            subtotal,
            products,
            discountedTotalElement


        } = req.body;

        console.log('disc',discountedTotalElement)

        //   console.log(selectedAddressId)
         console.log(subtotal+'sub')
        const newOrder = new Orders({
            user: userId,
            address: selectedAddressId,
            paymentMethod: paymentMethod,
            grandTotal: subtotal,
            products: products,
            discountedPrice:discountedTotalElement
        });

        const savedOrder = await newOrder.save();

        //    const user = await User.findByIdAndUpdate({_id:userId},{$set:{cart:[]}},{ new: true })  

        for (const product of products) {
            const productId = product.product
            const orderQuantity = product.quantity

            const productDoc = await Product.findById(productId)

            const newStock = productDoc.quantity - orderQuantity

            await Product.findByIdAndUpdate({ _id: productId }, { quantity: newStock })

        }
        console.log(req.body.paymentMethod)
        if (req.body.paymentMethod === 'COD') {
            const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { cart: [] } }, { new: true })

            res.json({ cod: true, savedOrder })
        } else if (req.body.paymentMethod === 'OnlinePayment') {
            console.log('online payment')
            const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { cart: [] } }, { new: true })

            userHelper.generateRazorpay(savedOrder._id, savedOrder.grandTotal).then((response) => {
                console.log(response)
                res.json({ orderId: savedOrder._id,response })
            })
        } else {
            const user = await User.findById(userId);
            if (user.Wallet < savedOrder.grandTotal) {
                return res.json({ walletError: true });
            } else {
                 const user = await User.findByIdAndUpdate({ _id: userId }, { $set: { cart: [] } }, { new: true })

                user.Wallet -= savedOrder.grandTotal

                user.transactions.push({
                    type: 'debit',
                    amount: savedOrder.grandTotal,
                    date: new Date()
                })
                savedOrder.orderStatus = 'Placed';
                savedOrder.paymentStatus = 'Paid';
                await savedOrder.save();
                await user.save();
                res.json({ walletSuccess: true ,savedOrder})
            }
        }

    } catch (error) {

        console.error('Error placing order:', error);
        // res.status(500).json({ message: 'Internal Server Error' });
    }
}

const verifyPayment = async (req, res) => {
    try {
        console.log('body', req.body);
        userHelper.verifyPayment(req.body).then(() => {
            userHelper.changePaymentStatus(req.body.order.receipt).then(() => {
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false })
        })

    } catch (error) {

    }
}

const paymentFailed = async (req, res) => {

    try {
        console.log('paymentfailed');
        const query = {
            paymentMethod: 'OnlinePayment',
            paymentStatus: 'Placed',
            orderStatus: 'Placed'
        };

        const pendingOrder = await Orders.findOne(query);
        console.log('hi', pendingOrder)
        const orderProducts = pendingOrder.products;

        for (const orderProduct of orderProducts) {
            const productId = orderProduct.product.toString();
            const quantity = orderProduct.quantity;
            console.log('quantity' + quantity);
            // Find the product in the Product model by its ID
            const product = await Product.findById(productId);
            console.log('product' + product);
            if (product) {

                // Decrease the product stock by the quantity from the order
                product.quantity = product.quantity + quantity;

                console.log(product.quantity)
                // Save the updated product
                await product.save();
            }

        }

        pendingOrder.orderStatus = 'Cancelled';
        pendingOrder.paymentStatus = 'Cancelled';

        const updated = await pendingOrder.save();

        if (updated) {
            res.redirect('/cart');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadSuccess = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId)
        const orderId = req.params.orderId
        const order = await Orders.findById(orderId).populate('products.product')

        console.log('Order ID:', orderId);

        res.render('orderSuccess', { user: user ,order})
    }
    catch (error) {
        console.log(error.message);
    }
}
const loadOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);

        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        const orders = await Orders.find()
            .sort({ createdOn: -1 })
            .populate({
                path: 'products.product',
                model: 'Products',
            })
            .populate('user', 'name email')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.render('orders', { orders: orders, user: user, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const path = require('path');  // Make sure to include this at the top of your file

const loadInvoice = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Orders.findById(orderId)
            .populate('user')
            .populate({
                path: 'products.product',
                model: 'Products',
            });

        const selectedAddressId = order.address;
        const selectedAddress = order.user.address.find(
            (address) => address._id.toString() === selectedAddressId.toString()
        );
        const user = await User.findById(order.user)
        if (!order) {
            return res.status(404).send("Order not found");
        }

        const data = {
            client: {
                selectedAddress,
                user
            },
            sender: {
                company: "ModaDecor",
                address: "Silicon",
                zip: "1234 AB",
                city: "Sampletown",
                country: "Samplecountry",
            },
            information: {
                number: `INV-${Math.floor(Math.random() * 1000000)}`,
                date: order.createdOn,
            },
            products: order.products.map((productDetail) => ({
                quantity: productDetail.quantity,
                description: productDetail.product.productName || "N/A",
                price: productDetail.product.salePrice || 0,
                discountPrice: productDetail.discountedPrice || 0,
                subtotal: (productDetail.product.salePrice || 0) * productDetail.quantity,
            })),
            Total: order.grandTotal || 0,
            DiscountedTotal: order.discountedPrice || 0,
        };

        const templatePath = path.join(__dirname, '..', 'views', 'user', 'invoice_template.ejs');

        // Debugging: Log information
        console.log('Current Directory:', __dirname);
        console.log('Template Path:', templatePath);
        console.log('Does File Exist?', fs.existsSync(templatePath));

        // Read the EJS template file
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        // Compile the EJS template
        const template = ejs.compile(templateSource);

        // Apply data to the template
        const html = template(data);

        // Function to generate PDF using Puppeteer
        async function generatePDF(html, outputPath) {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'domcontentloaded' });
            await page.pdf({ path: outputPath, format: 'A4' });
            await browser.close();
        }

        // Specify the output path for the PDF
        const outputPath = 'invoice.pdf';

        // Generate PDF
        await generatePDF(html, outputPath);

        // Send the PDF as a response or provide a download link
        res.download(outputPath);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






const orderDetail = async (req, res) => {
    try {
        const userId = req.session.user_id

        const orderId = req.query.id;
        console.log(orderId);
        const order = await Orders.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Products',
            })
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).send('Order not found');
        }
        const user = await User.findOne({ _id: order.user });

        const chosenAddressId = order.address;

        let chosenAddress;
        if (user && user.address) {
            chosenAddress = user.address.find((address) => address._id.toString() === chosenAddressId);
        }
        res.render('orderDet', { order: order, chosenAddress: chosenAddress, user: user });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const order = await Orders.findById(orderId);
        const userId = req.session.user_id

        if (order.paymentMethod === "OnlinePayment" ||
            order.paymentMethod === "Wallet" ||
            order.paymentMethod === "COD" && order.orderStatus.toLowerCase() === 'delivered') {
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Update the user's wallet balance and add a transaction
            user.Wallet += order.grandTotal;
            user.transactions.push({
                type: 'credit',
                amount: order.grandTotal,
                date: new Date()
            });

            await user.save();
        }

        if (order.orderStatus !== 'Delivered') {
            const updatedOrder = await Orders.findOneAndUpdate(
                { _id: orderId },
                { orderStatus: newStatus },
                { new: true }
            );

            if (!updatedOrder) {
                return res.status(404).json({ error: 'Order not found' });
            }
            for (const product of updatedOrder.products) {
                const { product: productId, quantity } = product;
                await Product.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { quantity: quantity } }, // Increment the stock by the canceled quantity
                    { new: true }
                );
            }


            return res.status(200).json({ message: 'Order status updated and product quantity added back to stock successfully' });
        } else {
            return res.status(403).json({ error: 'Cannot change status. Order is already delivered.', currentStatus: order.orderStatus });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}




const returnOrder = async (req, res) => {
    try {
        const { orderId, newStatus } = req.body;
        const updatedOrder = await Orders.findOneAndUpdate(
            { _id: orderId },
            { orderStatus: newStatus },
            { new: true }
        );

        const order = await Orders.findById(orderId);

        const userId = order.user;

        const user = await User.findById(userId)

        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }



        return res.status(200).json({ message: 'Order status updated to "Return Pending" successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const loadOrderSuccess1 = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId)
        const orderId = req.query.orderId
        console.log('Order ID:', orderId);

        const order = await Orders.findById(orderId)
            .populate({
                path: 'products.product',
                model: 'Products',
            })
       const productIds = order.products.map(pro=>pro.product)

       const products = await Product.find({_id:{$in:productIds}})

        console.log(order.products.quantity)
        console.log('Order ID:', orderId);

        res.render('orderSuccess1', { user: user ,order,products})
    }
    catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadCheckout,
    loadAddAddress,
    loadNewAddress,
    addAddress,
    placeOrder,
    loadSuccess,
    loadOrder,
    orderDetail,
    cancelOrder,
    returnOrder,
    createAddress,
    getCartItem,
    verifyPayment,
    paymentFailed,
    applyCoupon,
    selectCoupon,
    loadOrderSuccess1,
    loadInvoice
}
