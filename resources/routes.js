const Route = require('../models/route');
const { validationResult } = require('express-validator');
const per_page = require('../utils/config').per_page;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const from = req.body.from.toLowerCase();
    const to = req.body.to.toLowerCase();
    const distance = req.body.distance;
    const description = req.body.description.toLowerCase(); 

    const new_route = new Route(from, to, description, 0, distance, true, Date.now());

    Route.findByName(from, to)
    .then(route => {
        if(route) {
            const error = new Error(`${from}-${to} route exists already`);
            error.statusCode = 403;
            throw error;
        }

        return new_route.save();
    })
    .then(({ ops }) => {
        res.status(201).json({
            data:{
                route:ops[0]
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
        Route.all(req.user.admin)
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
        Route.count(req.user.admin)
        .then(count => {
            total = count;
            return Route.get(req.user.admin, skip, per_page);
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
