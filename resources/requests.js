const Request = require('../models/request');
const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const Route = require('../models/route');

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
    const user = { _id:req.user._id, name:req.user.name, avatar:req.user.avatar };
    let requested_vehicle, requested_route, saved_request;

    Vehicle.findByID(vehicleID)
    .then(vehicle => {
        if(!vehicle) {
            const error = new Error('vehicle does not exist');
            error.statusCode = 404;
            throw error;
        }

        delete vehicle.requests;
        delete vehicle.created_at;
        requested_vehicle = vehicle;
        return Route.findByID(routeID)
    })
    .then(route => {
        if(!route) {
            const error = new Error('route does not exist');
            error.statusCode = 404;
            throw error;
        }   

        delete route.description;
        delete route.created_at;
        requested_route = route;

        const expires_at = Date.now() + (days * 24 * 60 * 60);
        const request = new Request(user, requested_vehicle, requested_route, false, true, expires_at, Date.now());
        return request.save();
    })
    .then(({ op }) => {
        saved_request = op;
        
        return Vehicle.setPending(vehicleID, true)
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