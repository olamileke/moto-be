
const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const app_url = require('../utils/config').app_url;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    let admin;
    req.query.admin == 'true' ? admin = true : admin = false;
    const avatar = app_url + '/images/users/anon.png';

    User.findByEmail(email)
    .then(user => {
        if(user) {
            const error = Error('user exists already');
            error.statusCode = 403;
            throw error;
        }

        return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
        const user = new User(name, email, hashedPassword, admin, avatar, null, Date.now());
        return user.save();
    })
    .then(({ ops }) => {
        const new_user = { name:ops[0].name, email:ops[0].email, admin:ops[0].admin, avatar:ops[0].avatar };
        res.status(201).json({
            data:{
                user:new_user
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