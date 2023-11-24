const User = require('../models/userModel')

const loadUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = 6;
        const totalCount = await User.countDocuments({ isAdmin: 0 });
        const totalPages = Math.ceil(totalCount / itemsPerPage);

        const userData = await User.find({ isAdmin: 0 })
            .sort({ name: 1 })
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        res.render('users', { users: userData, totalPages: totalPages, currentPage: page });
    } catch (error) {
        console.log(error.message);
    }
};

const toggleController = async (req, res) => {
    try {
        const userId = req.body.id; 
        const userData = await User.findById(userId);

        if (userData) {
            
            userData.isActive = !userData.isActive;
            await userData.save();

            // Redirect back to the user list or any desired page
            res.redirect('/admin/users');
        } else {
            // Handle the case where the user with the specified ID was not found
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    loadUsers,
    toggleController
}