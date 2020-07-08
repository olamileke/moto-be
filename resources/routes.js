const Route = require('../models/route');
const { validationResult } = require('express-validator');

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw err;
    }

    const name = req.body.name;
    const description = req.body.description;

    const route = new Route(name, description, 0, Date.now());

    route.save()
    .then(({ op }) => {
        res.status(201).json({
            data:{
                route:op
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

    Route.get()
    .then(routes => {
        res.status(200).json({
            data:{
                routes:routes
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