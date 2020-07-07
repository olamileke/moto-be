const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = require('../utils/config').secret_key;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    let authenticated_user;

    User.findByEmail(email)
    .then(user => {
        if(!user) {
            const error = new Error('incorrect username or password');
            error.statusCode = 404;
            throw error;
        }
        
        authenticated_user = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
        if(!isEqual) {
            const error = new Error('incorrect username or password');
            error.statusCode = 404;
            throw error;
        }

        const token = jwt.sign({ userId:authenticated_user._id }, secret, { expiresIn:'14d' });

        res.status(200).json({
            data:{
                user:{ name:authenticated_user.name, email:authenticated_user.email, 
                admin:authenticated_user.admin, avatar:authenticated_user.avatar },
                token:token
            }
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    })
}