const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = require('../utils/config').secret_key;

module.exports = (req, res, next) => {

    const header = req.get('Authorization')
    let decodedToken;

    if(!header || !header.split(' ')[1]) {
        const error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
    }

    const token = header.split(' ')[1]

    try {
        decodedToken = jwt.verify(token, secret);
    }
    catch {
        const error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
    }

    if(!decodedToken) {
        const error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
    }

    User.findByID(decodedToken.userId)
    .then(user => {
        if(!user) {
            const error = new Error('not authenticated');
            error.statusCode = 401;
            throw error;
        }

        req.user = user;
        next();
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })

}