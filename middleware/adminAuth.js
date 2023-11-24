const isLogin = (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next(); // User is logged in, proceed
        } else {
            res.redirect('/admin'); // User is not logged in, redirect to login
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

// Middleware to check if the user is logged out
const isLogout = (req, res, next) => {
    try {
        if (!req.session.admin_id) {
                next()
        } else {
            res.redirect('/admin/dashboard'); // User is logged out, proceed
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = {
    isLogin,
    isLogout
}