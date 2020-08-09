const Request = require('../models/request');
const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const Route = require('../models/route');
const per_page = require('../utils/config').per_page;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const routeID = req.body.routeID;
    const vehicleID = req.body.vehicleID;
    const days = req.body.days; 
    const user = { _id:req.user._id, name:req.user.name, avatar:req.user.avatar, trips:req.user.trips };
    let requested_vehicle, requested_route, saved_request;

    Request.checkActiveDriver(req.user._id)
    .then(requests => {
        if(requests[0] && requests[0].pending) {
            const error = new Error('driver has a pending request');
            error.statusCode = 403;
            throw error;
        }

        if(requests[0] && !requests[0].pending && requests[0].approved) {
            const error = new Error('driver has an active request/trip');
            error.statusCode = 403;
            throw error;
        }

        return Vehicle.findByID(vehicleID);
    })
    .then(vehicle => {
        if(!vehicle) {
            const error = new Error('vehicle does not exist');
            error.statusCode = 404;
            throw error;
        }

        delete vehicle.active;
        delete vehicle.requests;
        delete vehicle.created_at;
        delete vehicle.pending;
        delete vehicle.reserved_till;
        delete vehicle.trips;
        requested_vehicle = vehicle;
        return Route.findByID(routeID)
    })
    .then(route => {
        if(!route) {
            const error = new Error('route does not exist');
            error.statusCode = 404;
            throw error;
        }
        
        if(!route.active) {
            const error = new Error('route is not active');
            error.statusCode = 400;
            throw error;
        }

        delete route.active;
        delete route.distance;
        delete route.description;
        delete route.created_at;
        delete route.trips;
        requested_route = route;

        const expires_at = Date.now() + (days * 24 * 60 * 60 * 1000);
        const request = new Request(user, requested_vehicle, requested_route, false, true, expires_at, Date.now());
        return request.save();
    }) 
    .then(({ op }) => {
        saved_request = op;
        
        return Vehicle.requestUpdate(vehicleID, true)
    })
    .then(() => {
        res.status(201).json({
            data:{
                request:saved_request
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
    let page, total, active;
    req.query.page ? page = req.query.page : page = 1;
    req.query.active == 'true' ? active = true : active = false;

    const skip = (page - 1) * per_page;

    if(!active) {
        Request.count(req.user.admin, req.user._id)
        .then(count => {
            total = count;
            return Request.get(req.user.admin, req.user._id, skip, per_page);
        })
        .then(requests => {
            res.status(200).json({
                data:{
                    requests:requests,
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
    else {
        Request.checkActiveDriver(req.user._id)
        .then(requests => {
            if(requests[0] && requests[0].pending) {
                res.status(200).json({
                    data:{
                        message:'you have a pending request'
                    }
                })
            }

            if(requests[0] && !requests[0].pending && !requests[0].approved) {
                res.status(200).json({
                    data:{
                        message:'you do not have an active request'
                    }
                })
            }

            res.status(200).json({
                data:{
                    request:requests[0]
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
