const Products =  require('../models/productModel')
const Category =require('../models/categoryModel')
const mongoose= require('mongoose')


const loadProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;
        const totalCount = await Products.countDocuments({ isDelete: false });
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const productData = await Products.find({ isDelete: false })
            .populate('category')
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.render('products', { products: productData, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};





const loadAddProducts= async (req,res)=>{
    try{
        const categoryData = await Category.find({isDelete:false})
        console.log(categoryData)
        res.render('addproduct',{Category:categoryData})
    }
    catch(error){
        console.log(error.message);
    }
}
const addProducts = async (req, res) => {
    try {
        const img = req.files.map((file) => file.filename);

        // Get the category name from the request
        const categoryName = req.body.category;

        // Find the category by name
        const category = await Category.findOne({ name: categoryName });

        if (!category) {
            console.log('Category not found');
        }

        let product = new Products({
            productName: req.body.productName,
            brandName: req.body.brandName,
            category: category, // Use the category object if found, or null if not found
            quantity: req.body.quantity,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            description: req.body.description,
            image: img
        });

        const products = await product.save();

        if (products) {
            res.redirect('/admin/products');
        }
    } catch (error) {
        console.log(error.message);
    }
};
const loadEditProducts = async (req, res) => {
    try {
        const category = await Category.find({ isDelete: false });
        console.log(category)
        const productId = req.params.id; // Assuming 'id' is the parameter in your route
        console.log(productId)
        // Attempt to find the product by its ID
        const product = await Products.findById(productId).populate('category');

        if (!product) {
            // Handle the case where the product is not found, e.g., display an error message.
            return res.status(404).send('Product not found');
        }
        
        // Pass the product object to the 'editProduct' view.
        res.render('editProduct', { product: product, errMessage: '', message: '', categories: category });
    } catch (error) {
        console.log(error.message);
    }
};



const updateProducts = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedCategory = req.body.category; // Assuming this is a valid category ID

        // Check if new images were provided
        let imgFilenames = [];

        if (req.files && req.files.length > 0) {
            imgFilenames = req.files.map((file) => file.filename);
        } else {
            // If no new images provided, retrieve the existing ones
            const existingProduct = await Products.findById(productId);
            imgFilenames = existingProduct.image;
        }

        const updatedData = {
            productName: req.body.productName,
            brandName: req.body.brandName,
            Category: updatedCategory,
            quantity: req.body.quantity,
            regularPrice: req.body.regularPrice,
            salePrice: req.body.salePrice,
            description: req.body.description,
            image: imgFilenames,
        };

        // Find the product by ID and update it
        const updatedProduct = await Products.findByIdAndUpdate(
            productId,
            { $set: updatedData },
            { new: true } // This ensures that you get the updated product back
        );

        if (updatedProduct) {
            res.redirect('/admin/products');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const deleteProducts = async (req, res) => {
    try {
        const productId = req.body.id;
        console.log("Product ID:", productId);

        const productData = await Products.findByIdAndUpdate(productId, { isDelete: true });

        if (productData) {
            console.log("Product Soft Deleted:", productData);
        } else {
            console.log("Product not found");
        }

        res.redirect('/admin/products');
    } catch (error) {
        console.log("Error:", error.message);
    }
}



module.exports  = {
    loadProducts,
    loadAddProducts,
    addProducts,
    loadEditProducts,
    updateProducts,
    deleteProducts
}