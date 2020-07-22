const User = require('../models/user');
const PasswordReset = require('../models/PasswordReset');
const mail = require('../utils/mail');
const crypto = require('crypto');
const path = require('path');
const config = require('../utils/config');

exports.post = (req, res, next) => {
    const actions = ['verify_email', 'verify_token'];
    const action = req.query.action;

    if(!actions.includes(action)) {
        const error = new Error('unknown action to execute');
        error.statusCode = 400;
        throw error;
        next(error);
    }

    if(action == 'verify_email') {
        verifyEmail(req, res, next);
    }

    if(action == 'verify_token') {
        verifyResetToken(req, res, next);
    }
}

async function verifyResetToken(req, res, next) {
    const token = req.body.token;

    if(!token) {
        const error = new Error('reset token is required');
        error.statusCode = 422;
        throw error;
    }

    PasswordReset.findByToken(token)
    .then(reset => {
        if(!reset) {
            const error = new Error('invalid reset token');
            error.statusCode = 404;
            throw error;
        }

        if(Date.now() > reset.expires_at) {
            PasswordReset.delete(reset._id)
            .then(() => {
                const error = new Error('expired reset token');
                error.statusCode = 400;
                throw error;
            })
        }   
        else {
            res.status(200).json({
                data:{
                    message:'reset token is valid'
                }
            })
        }
    })
    .catch(err => {
        if(!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

async function verifyEmail(req, res, next) {
    const email = req.body.email;

    if(!email) {
        const error = new Error('email is required');
        error.statusCode = 422;
        throw error;
    }

    User.findByEmail(email)
    .then(user => {
        if(!user) {
            const error = new Error('user does not exist');
            error.statusCode = 404;
            throw error;
        }

        return crypto.randomBytes(32, (err, buffer) => {
            if(err) {
                err.statusCode = 500;
                throw err;
            }

            const token = buffer.toString('hex');
            const expiry = Date.now() + (30 * 60 * 1000);
            const reset = new PasswordReset(user._id, user.name, user.email, token, expiry, Date.now());
            reset.save()
            .then(({ ops }) => {
                const reset = ops[0];
                const dt = new Date(reset.expires_at);
                const hours = dt.getHours();
                const minutes = dt.getMinutes();
                let hrs, mins;
                String(hours).length == 1 ? hrs = '0' + String(hours) : hrs = String(hours);
                String(minutes).length == 1 ? mins= '0' + String(minutes) : mins = String(minutes);
                reset.expires_at = `${hrs}:${mins}`;
                const data = { reset:reset };
                mail(data, 'Change your Password', path.join(config.app_root, 'templates', 'reset_password.html'), next);
                res.status(200).json({
                    data:{
                        message:'password reset email sent successfully'
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