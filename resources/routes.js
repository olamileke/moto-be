const Route = require('../models/route');
const { validationResult } = require('express-validator');
const per_page = require('../utils/config').per_page;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw err;
    }

    const name = req.body.name.toLowerCase();
    const description = req.body.description.toLowerCase(); 

    const new_route = new Route(name, description, 0, Date.now());

    Route.findByName(name)
    .then(route => {
        if(route) {
            const error = new Error(`${name} route exists already`);
            error.statusCode = 403;
            throw error;
        }

        return new_route.save();
    })
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

    let page, total;
    req.query.page ? page = req.query.page : page = 1;
    const skip = (page - 1) * per_page;

    if(req.query.all == 'true') {
        Route.all()
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
    else {
        Route.count()
        .then(count => {
            total = count;
            return Route.get(skip, per_page);
        })
        .then(routes => {
            res.status(200).json({
                data:{
                    routes:routes,
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
}
