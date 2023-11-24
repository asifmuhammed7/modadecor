const User = require('../models/userModel')
const Products = require('../models/productModel')
const Category = require('../models/categoryModel')
const Banner = require('../models/bannerModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
require('dotenv').config();
let otp = 0;

const loadregister = async (req, res, next) => {
    try {
        const user = req.session.user_id
        res.render('registration', { message: '', errMessage: '', user: user })
        console.log('registration');
    }
    catch (error) {
        console.log('registration');
        console.log(error.message);
    }
}
const insertUser = async (req, res) => {
    try {
        const email = req.body.email
        const checkData = await User.findOne({ email: email })
        if (checkData) {
            res.render('registration', { errMessage: 'User already found', message: '' })
        } else {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mobile,
                password: req.body.password
            })
            const userData = await user.save()

            if (userData) {
                res.render('registration', { message: 'Registration succesfull', errMessage: '' })
            }
        }
    }
    catch (error) {
        console.log(error.message);
    }
}

const verifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = req.session.user_id
        const userData = await User.findOne({ email: email });
        if (!userData) {
            res.render('login', { message: 'Invalid Email or Password', user: user });

        }
        if (userData.isActive === false) {
            res.render('login', { message: 'User blocked', user: user })
        }
        if (userData) {

            // Compare the hashed password with the provided password
            const isPasswordValid = await bcrypt.compare(password, userData.password);

            console.log(password);
            console.log(userData.password);
            if (isPasswordValid) {
                req.session.user_id = userData._id;
                // const product = await Products.find({ isDelete: false })
                // const category = await Category.find({ isDelete: false });
                console.log(req.session.user_id);
                const categories = await Category.find({ isDelete: false });
                const banners = await Banner.find({isActive:true})

        const filter = { isDelete: false,
            category:{$in:categories.map(cat => cat._id)} };
            const product = await Products.find(filter)  
                res.render('home', { user: userData, product: product, category: categories,banners });
            } else {
                res.render('login', { message: 'Invalid Email or Password', user: user });
            }
        } else {
            res.render('login', { message: 'Invalid Email or Password', user: user });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome1 = async (req, res, next) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId)
        // const product = await Products.find({ isDelete: false })
        const categories = await Category.find({ isDelete: false });
        const banners = await Banner.find({isActive:true})

        const filter = { isDelete: false,
            category:{$in:categories.map(cat => cat._id)} };
            const product = await Products.find(filter)  
        res.render('home', { product: product, Category: categories, user: user,banners });
        // res.render('home', { product: product, Category: category, user: user });
    }
    catch (error) {
        console.log(error.message);
    }
}
const userLogout = async (req, res) => {

    try {

        req.session.user_id = null;
        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId).populate('wishlist')

        const banners = await Banner.find({isActive:true})
        // const product = await Products.find({ isDelete: false })
        const categories = await Category.find({ isDelete: false });
        
        const filter = { isDelete: false,
            category:{$in:categories.map(cat => cat._id)} };
            const product = await Products.find(filter)  
        res.render('home', { product: product, Category: categories, user: user, banners });
    } catch (error) {
        console.log(error.message);
    }
}
const loadOtp = async (req, res) => {

    try {
        const user = req.session.user_id
        console.log(user)
        res.render('otp', { message: '', errMessage: '' });
    } catch (error) {
        console.log(error.message)
    }
}
const sendOtp = async (req, res) => {

    try {
        const user = req.session.user_id
        const email = req.body.email;
        const checkData = await User.findOne({ email: email });

        if (checkData) {
            res.render('registration', { message: '', errMessage: 'Email Already Exists!!!', user: user });
        } else {

            req.session.temp = new User({

                name: req.body.name,
                mobile: req.body.mobile,
                email: req.body.email,
                password: req.body.password
            });

            res.redirect('/otp')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req, res) => {

    try {
        const user = req.session.user_id
        otp = generateOtp();
        console.log(otp);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'test@modadecor.com',
            to: req.session.temp.email,
            subject: 'Your OTP',
            text: `Your OTP is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.redirect('/register');
            } else {
                console.log('Email sent:');
                res.render('otp', { showLoginLink: true, user: user, errMessage: '' });
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}

const verified = async (req, res) => {

    try {
        const user = req.session.user_id

        if (req.body.otp === String(otp)) {

            const securePword = await securePassword(req.session.temp.password);

            const details = new User({
                name: req.session.temp.name,
                mobile: req.session.temp.mobile,
                email: req.session.temp.email,
                password: securePword
            });

            const userData = await details.save();

            if (userData) {
                req.session.temp = null;
                res.status(200).json({ message: 'User successfully verified and created.' });

                // res.redirect('/login');
            }

        } else {
            res.status(400).json({ error: 'Incorrect OTP. Please try again.' });
        }

    } catch (error) {
        console.log(error.message);
    }
}
const loadShop = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId);

        const categories = await Category.find({ isDelete: false });

        const categoryId = req.query.categoryId;
        const priceRange = req.query.priceRange;
        const page = req.query.page || 1;
        const itemsPerPage = 6;

        const filter = { isDelete: false };

        if (categoryId) {
            filter.category = categoryId;
        }

        if (priceRange !== undefined) {
            // Assuming priceRange is now a numeric value representing the upper limit
            const maxPrice = parseInt(priceRange);

            // Check if maxPrice is a valid number
            if (!isNaN(maxPrice)) {
                filter.salePrice = { $lte: maxPrice };
            } else {
                // Handle the case where maxPrice is not a valid number
                console.error('Invalid maxPrice:', req.query.priceRange);
                // Provide a default value or handle the error accordingly
            }
        }

        const totalProducts = await Products.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / itemsPerPage);
        const skip = (page - 1) * itemsPerPage;

        const products = await Products.find(filter)
            .skip(skip)
            .limit(itemsPerPage);

        res.render('shop', {
            product: products,
            Category: categories,
            user: user,
            totalPages: totalPages,
            currentPage: page,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const loadProductDetails = async (req, res) => {

    try {
        const user = req.session.user_id
        const productId = req.query.id;
        console.log('productid', productId);

        const Data = await Products.findById(productId)
        console.log(Data)
        res.render('productDetails', { Products: Data, user: user });


    } catch (error) {
        console.log(error.message);
    }
}
function generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
}

const securePassword = async (password) => {

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        return hashedPassword;

    } catch (error) {

        console.log(error.message);

    }
}
const loadLogin = async (req, res) => {
    try {
        const user = req.session.user_id
        const product = await Products.find({ isDelete: false })
        const category = await Category.find({ isDelete: false });
        res.render('login', { product: product, Category: category, user: user, message: '' });
    }
    catch (error) {
        console.log(error.message);
    }
}

const userProfile = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById({ _id: userId }).populate('address')
        console.log(user)
        res.render('userProfile', { user: user ,error:''})
    }
    catch (error) {
        console.log(error.message)
    }
}

// const loadCheckout =async (req,res)=>{
//     try{
//         const userId = req.session.user_id
//         const user = await User.findById({_id:userId})

//         res.render('checkout',{user:user})
//     }
//     catch(error){
//         console.log(error.message);
//     }
// }
const searchProducts = async (req, res) => {
    try {
        const user = req.session.user_id;
        const searchQuery = req.query.q;
        const categoryFilter = req.query.category;
        const priceRange = req.query.priceRange;

        const filterConditions = {
            $or: [
                { productName: { $regex: new RegExp(searchQuery, 'i') } },
                { brandName: { $regex: new RegExp(searchQuery, 'i') } },
            ],
        };

        if (categoryFilter) {
            filterConditions.category = categoryFilter;
        }

        if (priceRange !== undefined) {
            const maxPrice = parseInt(priceRange);

            if (!isNaN(maxPrice)) {
                filterConditions.salePrice = { $lte: maxPrice };
            } else {
                console.error('Invalid maxPrice:', req.query.priceRange);
            }
        }

        const searchResults = await Products.find(filterConditions);

        console.log(searchResults);

        const category = await Category.find();

        if (searchResults.length === 0) {
            res.render('searchResults', {
                product: searchResults,
                message: 'No products found',
                Category: category,
                user: user,
                searchQuery,
            });
        } else {
            res.render('searchResults', {
                searchQuery,
                product: searchResults,
                Category: category,
                user: user,
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};




const loadAddress = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findById(userId).populate('cart.product')
        const addresses = await user.address.filter(address => !address.isDelete);

        res.render('myAddress', { cart: user.cart, addresses: addresses, user: userId })
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const addressId = req.params.id;

        const user = await User.findById(userId);

        const addressIndex = user.address.findIndex(addr =>
            String(addr._id) === addressId
        );

        if (addressIndex !== -1) {
            user.address[addressIndex].isDelete = true; // Setting isDelete to true
            await user.save();
            res.status(200).json({ message: 'Address marked as deleted successfully' });
        } else {
            res.status(404).json({ message: 'Address not found' });
        }
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};


const loadEditAddress = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const addressId = req.query.id;
        const user = await User.findById(userId);

        const addressToEdit = user.address.find(address => address._id.toString() === addressId);

        if (addressToEdit) {
            res.render('editAddress', { address: addressToEdit, user: userId });
        } else {
            res.status(404).send('Address not found');
        }
    } catch (error) {
        console.error('Error loading edit address:', error);
        res.status(500).send('Server Error');
    }
};


const updateAddress = async (req, res) => {
    const addressId = req.params.id;
    const { name, address, district, city, pincode, phone } = req.body;

    try {
        const user = await User.findById(req.session.user_id);
        const addressIndex = user.address.findIndex((addr) => addr._id.toString() === addressId);

        if (addressIndex !== -1) {
            user.address[addressIndex] = { _id: addressId, name, address, district, city, pincode, phone };
            await user.save();
            res.redirect('/myAddress'); // Redirect to the appropriate page after successful update
        } else {
            res.status(404).send('Address not found');
        }
    } catch (error) {
        console.error('Error updating address:', error);

        status(500).send('Server Error');
    }
}

const loadAccount = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { dname, email, mobile } = req.body;
        let profileImage = '';

        const user = await User.findById({ _id: userId }).populate('address');

        if (req.file) {
            profileImage = req.file.filename;
        }

        const userWithEmail = await User.findOne({ email });
        if (userWithEmail && userWithEmail._id.toString() !== userId) {
            return res.render('userProfile', { error: 'Email already in use', user: user });
        }

        if (profileImage) {

            await User.findByIdAndUpdate(userId, {
                name: dname,
                email,
                mobile,
                profileImage: profileImage,
            });
        } else {

            await User.findByIdAndUpdate(userId, {
                name: dname,
                email,
                mobile,
            });
        }

        res.redirect('/userProfile');
    } catch (error) {
        console.error(error.message);
        res.status(500).render('userProfile', { error: 'Error updating user information', user: user });
    }
};

const loadWishlist = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId) 

        const products = []

        for(const productId of user.wishlist){
            const product = await Products.findById(productId)
            products.push(product)
        }
        console.log(user)
        
            res.render('wishlist', { user :user,products}); 
        
    } catch (error) {
        console.error(error.message);
    }
};

const loadWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (!userId) {
            console.log("User ID is not available in the session.");
            return res.redirect('/login');
        }

        const user = await User.findById(userId).populate('Wallet');
        if (!user) {
            console.log("User not found.");
            return res.redirect('/login');
        }
        user.transactions.sort((a, b) => b.date - a.date);

        const sortedTransaction = user.transactions;

        const transactionCount = sortedTransaction.length
        const page = req.query.page || 1
        const itemsPerPage = 10;
        const skip = (page - 1) * itemsPerPage

        
        const totalPages = Math.ceil(transactionCount / itemsPerPage)
        const paginatedTransactions = sortedTransaction.slice(skip, skip + itemsPerPage);


        const wallet = user.Wallet
        res.render('wallet', { user ,wallet:user.Wallet,transactions:paginatedTransactions,currentPage:page,totalPages})
    } catch (error) {
        console.log(error.message);
        res.redirect('/errorPage');
    }
}


const AddToWishlist = async (req, res) => {
    try {
        const productId = req.query.productId
        console.log(productId)
        const userId = req.session.user_id;

        const user = await User.findById(userId);

        
            
            if (!user.wishlist.includes(productId)) {
                user.wishlist.push(productId); 
                await user.save();
                res.redirect('/wishlist'); 
            } else {
                res.render('wishlist', { user:user, error: 'Product already in the wishlist' }); 
            }
        
    } catch (error) {
        console.error(error.message);
        res.render('wishlist', { error: 'An error occurred while adding to wishlist' }); 
    }
};
const deleteWish = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const itemId = req.params.itemId;
        await User.updateOne({ _id: userId }, { $pull: { wishlist: itemId } });
        res.json({ success: true, message: 'Item successfully removed from wishlist' });
    } catch (error) {
        console.error('Error removing item from wishlist:', error);
        res.status(500).json({ success: false, message: 'Error removing item from wishlist' });
    }
}

module.exports = {
    loadLogin,
    loadHome1,
    userLogout,
    loadregister,
    verifyUser,
    insertUser,
    loadHome,
    loadOtp,
    sendOtp,
    otpVerify,
    verified,
    loadShop,
    loadProductDetails,
    userProfile,
    searchProducts,
    loadAddress,
    deleteAddress,
    loadEditAddress,
    updateAddress,
    loadAccount,
    loadWishlist,
    AddToWishlist,
    deleteWish,
    loadWallet

}