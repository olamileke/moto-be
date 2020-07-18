const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../utils/config');

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
    let auth_user;

    User.findByEmail(email)
    .then(user => {
        if(!user || user.activation_token) {
            const error = new Error('incorrect username or password');
            error.statusCode = 404;
            throw error;
        }
        
        auth_user = user;
        return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
        if(!isEqual) { 
            const error = new Error('incorrect username or password');
            error.statusCode = 404;
            throw error;
        }


        const token = jwt.sign({ userId:auth_user._id }, config.secret_key, { expiresIn:'14d' });
        const user = { name:auth_user.name, email:auth_user.email, admin:auth_user.admin, avatar:auth_user.avatar }

        res.status(200).json({
            data:{
                user:user,
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