const User = require('../models/user');
const PasswordReset = require('../models/PasswordReset');
const Request = require('../models/request');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const file = require('../utils/file');
const path = require('path');
const per_page = require('../utils/config').per_page;
const crypto = require('crypto');
const config = require('../utils/config');
const mail = require('../utils/mail');

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
    let admin, activationToken;
    req.query.admin == 'true' ? admin = true : admin = false;
    const avatar = config.s3_file_link + 'users/anon.png';

    User.findByEmail(email)
    .then(user => {
        if(user) {
            const error = Error('user exists already');
            error.statusCode = 403;
            throw error;
        }

        return crypto.randomBytes(32, (err, buffer) => {
            if(err) {
                const error = new Error('an error occured');
                error.statusCode = 500;
                throw error;
            }

            activationToken = buffer.toString('hex');
            return bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User(name, email, hashedPassword, admin, avatar, activationToken, 0, Date.now(), Date.now());
                return user.save();
            })
            .then(() => {
                const new_user = { name:name, email:email, admin:admin, avatar:avatar };
                const mail_user = { ...new_user, activation_token:activationToken };
                const data = { user:mail_user }
                mail(data, 'Activate your Account', path.join(config.app_root, 'templates', 'activate.html'), next);
                res.status(201).json({
                    data:{
                        user:new_user
                    }
                })
            })
        })
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }

        next(err);
    })
}

exports.get = (req, res, next) => {
    let page, total;
    
    req.query.page ? page = req.query.page : page = 1;
    const skip = (Number(page) - 1) * per_page;

    User.count()
    .then(count => {
        total = count;
        return User.get(skip, per_page);
    })
    .then(users => {
        users.forEach(user => {
            delete user._id;
            delete user.activation_token;
            delete user.password;
        })

        res.status(200).json({
            data:{
                users:users,
                total:total
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

exports.patch = (req, res, next) => {
    const fields = ['activation_token', 'password'];
    const field = req.query.field;

    if(!fields.includes(field)) {
        const error = new Error('unknown field to edit');
        error.statusCode = 400;
        throw error;
        next(error);
    }

    if(field == 'activation_token') {
        activate(req, res, next);
    }

    if(field == 'password') {
        resetPassword(req, res, next);
    }
}

exports.put = (req, res, next) => {
   
    if(!req.file) {
        const error = new Error('image is required');
        error.statusCode = 422;
        throw error;
    }

    const defaultAvatar = config.s3_file_link + 'users/anon.png';
    req.user.avatar != defaultAvatar ? file.delete(req.user.avatar, next) : '';

    file.upload(req, res, next, 'users', avatar => {
        User.changeAvatar(req.user._id, avatar)
        .then(() => {
            return Request.updateUser(req.user._id, avatar);
        })
        .then(() => {
            const patchedUser = { name:req.user.name, email:req.user.email, admin:req.user.admin, avatar:avatar };
            res.status(200).json({
                data:{
                    user:patchedUser
                }
            })
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
    })
}

async function resetPassword(req, res, next) {
    const password = req.body.password;
    const token = req.body.token;
    let updatedUser, resetToUse;

    if(!password || password.length < 8) {
        const error = new Error('validation failed. password must be at least 8 characters.');
        error.statusCode = 422;
        throw error;
    }

    if(!token) {
        const error = new Error('validation failed. reset token is required.');
        error.statusCode = 422;
        throw error;
    }

    PasswordReset.findByToken(token)
    .then(reset => {
        if(!reset) {
            const error = new Error('invalid reset token');
            error.statusCode = 400;
            throw error;
        }

        resetToUse = reset;
        return User.findByID(reset.userId);
    })
    .then(user => {
        if(!user) {
            const error = new Error('user does not exist');
            error.statusCode = 404;
            throw error;
        }

        updatedUser = user;
        return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
        return User.changePassword(updatedUser._id, hashedPassword)
        .then(() => {
            return PasswordReset.delete(resetToUse._id)
        })
    })
    .then(() => {
        const user = { name:updatedUser.name, email:updatedUser.email,
        admin:updatedUser.admin, avatar:updatedUser.avatar };
        res.status(200).json({
            data:{
                user:user
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

async function activate(req, res, next) {
    const token = req.body.token;

    if(!token) {
        const error = new Error('validation failed.activation token is required');
        error.statusCode = 422;
        throw error;
    }

    let activatedUser;

    User.findByActivationToken(token)
    .then(user => {
        if(!user) {
            const error = new Error('invalid activation token');
            error.statusCode = 404;
            throw error;
        }

        activatedUser = { name:user.name, email:user.email,
         admin:user.admin, avatar:user.avatar };
        return User.activate(user._id);
    })
    .then(() => {
        res.status(200).json({
            data:{
                user:activatedUser
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
