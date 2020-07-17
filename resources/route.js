const Route = require('../models/route');
const Request = require('../models/request');
const { validationResult }  = require('express-validator');
const { request } = require('express');

exports.put = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const routeID = req.params.routeID;
    const name = req.body.name.toLowerCase();
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

        return Route.update(routeID, name, description)
    })
    .then(route => {
        updatedRoute = route;
        return Request.updateRoute(routeID, name);
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
    let active, patchedRoute;
    req.query.active == 'true' ? active = true : active = false;

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