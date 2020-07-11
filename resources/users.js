const User = require('../models/user');
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
    .then(({ ops }) => {
        delete ops._id;
        delete ops.activation_token;
        delete ops.password;

        const new_user = ops;

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
    res.json({
        leke:'user'
    })
    // const field = req.query.field;
    // const allowedFields = ['avatar'];
    // console.log(req.query.field);

    // if(!allowedFields.includes(field)) {
    //     const error = new Error('unknown field to patch');
    //     error.statusCode = 400;
    //     throw error;
    // }

    // const old_avatar = req.user.avatar;
    // const generic_avatar = app_url + 'images/users/anon.png';
    // const new_avatar = app_url + req.file.path.replace(/\\/g, '/');
    // const old_path = path.join(app_root, 'images', 'users', old_avatar.split('images/users/')[1]);

    // User.changeAvatar(req.user._id, new_avatar)
    // .then(({ op }) => {
    //     if(old_avatar != generic_avatar) {
    //         file.delete(old_path)
    //     }

    //     delete ops._id;
    //     delete ops.activation_token;
    //     delete ops.password;

    //     return ops;
    // })
    // .then(updated_user => {
    //     res.status(200).json({
    //         data:{
    //             user:updated_user
    //         }
    //     })
    // })
    // .catch(err => {
    //     if(!err.statusCode) {
    //         err.statusCode = 500;
    //     }

    //     next(err);
    // })
}

async function changeAvatar(req, res, next)  {
    
}