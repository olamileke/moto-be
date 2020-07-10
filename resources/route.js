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
    const name = req.body.name;
    const description = req.body.description;
    let updatedRoute;

    Request.checkActiveRoute(routeID)
    .then(request => {
        if(request && request.pending) {
            const error = new Error('there is a pending vehicle request for this route');
            error.statusCode = 403;
            throw error;
        }

        if(request && !request.pending && request.approved) {
            const error = new Error('a driver is plying this route currently');
            error.statusCode = 403;
            throw error;
        }

        return Route.update(routeID, name, description)
    })
    .then(({ op }) => {
        updatedRoute = op;
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