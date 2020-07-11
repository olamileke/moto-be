const User = require('../models/user');
const Request = require('../models/request');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const app_url = require('../utils/config').app_url;
const app_root = require('../utils/config').app_root;
const file = require('../utils/file');
const path = require('path');

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
    const avatar = app_url + 'images/users/anon.png';

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
        const user = new User(name, email, hashedPassword, admin, avatar, null, 0, Date.now(), Date.now());
        return user.save();
    })
    .then(() => {
        const new_user = { name:name, email:email, admin:admin, avatar:avatar };
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

exports.get = (req, res, next) => {
    
    User.get()
    .then(users => {
        users.forEach(user => {
            delete user._id;
            delete user.activation_token;
            delete user.password;
        })

        res.status(200).json({
            data:{
                users:users
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
    const fields = ['avatar', 'password'];
    const field = req.query.field;
    let newAvatar;

    if(!fields.includes(field)) {
        const error = new Error('unknown field to patch');
        error.statusCode = 400;
        throw error;
    }

    if(field == 'avatar') {
        if(!req.file) {
            const error = new Error('image is required');
            error.statusCode = 422;
            throw error;
        }

        const oldAvatar = app_url + 'images/users/anon.png';
        req.user.avatar != oldAvatar ? file.delete(req.user.avatar) : '';
        newAvatar = app_url + req.file.path.replace(/\\/g, '/');
        
        User.changeAvatar(req.user._id, newAvatar)
        .then(() => {
            return Request.updateUser(req.user._id, newAvatar);
        })
        .then(() => {
            const patchedUser = { name:req.user.name, email:req.user.email, admin:req.user.admin, avatar:newAvatar };
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
    }
}