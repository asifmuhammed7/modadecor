const Category = require ('../models/categoryModel')

const loadCategory = async(req,res)=>{
    try{
        const categoryData = await Category.find()
        console.log(categoryData)
        res.render('category',{category:categoryData,message:'',errMessage:''})
    }
    catch (error){
        console.log(error.message);
    }
}
const mongoose = require('mongoose'); // Import Mongoose for ObjectId validation

const loadNewCategory = async (req, res) => {
    try {
        const name = req.body.name;

        const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });

        if (existingCategory) {
            existingCategory.isDelete = false;
            await existingCategory.save();
        } else {
            const newCategory = new Category({
                name: name
            });

            await newCategory.save();
        }

        return res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
    }
}

const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ObjectId' });
        }

        const categoryData = await Category.findById(id);

        if (categoryData) {
            res.render('categoryedit', { category: categoryData,message:'',errMessage:'' });
        } else {
            res.redirect('/categoryEdit');
        }
    } catch (error) {
        console.log(error.message);
    }
}
const loadDeleteCategory = async (req, res) => {
    try {
        const categoryId = req.query.id;
        console.log("Category ID:", categoryId);

        const categoryData = await Category.findById(categoryId);
        console.log("Category Data:", categoryData);

        if (categoryData) {
            console.log("Before Soft Delete:", categoryData);

            await Category.updateOne({ _id: categoryId }, { $set: { isDelete: true } });


            console.log("After Soft Delete:", categoryData);
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.log("Error:", error.message);
    }
}
const updateCategory = async (req, res) => {
    try {
        const { id, name } = req.body;

        const existingCategoryWithSameName = await Category.findOne({
            name: { $regex: new RegExp('^' + name + '$', 'i') }, // Case-insensitive regex match
            _id: { $ne: id },
        });

        if (existingCategoryWithSameName) {
            const categoryData = await Category.findById(id);
            return res.render('categoryedit', { category: categoryData, errMessage: 'Category already exists' });
        }

        let updatedCategory;

        if (id) {
            updatedCategory = await Category.findByIdAndUpdate(id, { name }, { new: true });
        } else {
            updatedCategory = await Category.create({ name });
        }

        res.redirect('/admin/category');
    } catch (error) {
        console.error('Error updating/creating category:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteCategory = async (req, res) => {

    try {
        console.log(req.body.id)
        const Data = await Category.findById(req.body.id);

        if (Data) {
            Data.isDelete = !Data.isDelete;
            await Data.save();
        }

        const category = await Category.find()

        res.json({success : true, category: category})

    } catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    loadCategory,
    loadNewCategory,
    loadEditCategory,
    loadDeleteCategory,
    updateCategory,
    deleteCategory
}