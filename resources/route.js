const Route = require('../models/route');
const Request = require('../models/request');
const { validationResult }  = require('express-validator');

exports.put = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const routeID = req.params.routeID;
    const from = req.body.from.toLowerCase();
    const to = req.body.to.toLowerCase();
    const distance = req.body.distance;
    const description = req.body.description.toLowerCase();
    let updatedRoute;

    return Route.findByID(routeID)
    .then(route => {
        if(!route) {
            const error = new Error('route does not exist');
            error.statusCode = 404;
            throw error;
        }

        return Request.checkActiveRoute(routeID)
    })
    .then(requests => {
        if(requests[0] && requests[0].pending) {
            const error = new Error('there is a pending vehicle request for this route');
            error.statusCode = 403;
            throw error;
        }

        if(requests[0] && !requests[0].pending && requests[0].approved && requests[0].expires_at >= Date.now()) {
            const error = new Error('a driver is plying this route currently');
            error.statusCode = 403;
            throw error;
        }

        return Route.findByName(from, to)
        .then(route => {
            if(route && route._id.toString() != routeID) {
                const error = new Error('route with name exists already');
                error.statusCode = 403;
                throw error;
            }
            return Route.update(routeID, from, to, distance, description)
        })
    })
    .then(route => {
        updatedRoute = route;
        return Request.updateRoute(routeID, from, to);
    })
    .then(() => {
        res.status(201).json({
            data:{
                route:updatedRoute
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
    
    const routeID = req.params.routeID;
    let active = true, patchedRoute;
    req.query.active == 'false' ? active = false : '';

    Route.findByID(routeID)
    .then(route => {
        if(!route) {
            const error = new Error('route does not exist');
            error.statusCode = 404;
            throw error;
        }

        patchedRoute = route;
        return Request.checkActiveRoute(routeID);
    })
    .then(requests => {
        if(requests[0] && requests[0].pending) {
            const error = new Error('there is a pending vehicle request for this route');
            error.statusCode = 403;
            throw error;
        }

        if(requests[0] && !requests[0].pending && requests[0].approved && requests[0].expires_at >= Date.now()) {
            const error = new Error('a driver is plying this route currently');
            error.statusCode = 403;
            throw error;
        }

        return Route.setActiveState(routeID, active);
    })
    .then(() => {
        const route = { ...patchedRoute, active:active };
        res.status(200).json({
            data:{
                route:route
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