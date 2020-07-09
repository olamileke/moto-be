const User = require('../models/user');

module.exports = (req, res, next) => {
    const admin = req.query.admin;

    if(admin == 'true') {
        if(!req.user.admin) {
            const error = new Error('you are not authorized');
            error.statusCode = 403;
            throw error;
        }
        else {
            next();
        }
    }
    else {
        next();
    }
}