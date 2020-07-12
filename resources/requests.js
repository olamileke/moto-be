const Request = require('../models/request');
const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const Route = require('../models/route');
const User = require('../models/user');
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
    const user = { _id:req.user._id, name:req.user.name, avatar:req.user.avatar };
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
    let admin, page, total;
    req.query.admin == 'true' ? admin = true : admin = false;
    req.query.page ? page = req.query.page : page = 1;

    const skip = (page - 1) * per_page;

    Request.count(admin, req.user._id)
    .then(count => {
        total = count;
        return Request.get(admin, req.user._id, skip, per_page);
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

exports.patch = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw errors;
    }

    const requestID = req.body.requestID;
    let approved, patchedRequest;
    req.query.approved == 'true' ? approved = true : approved = false;

    Request.findByID(requestID)
    .then(request => {
        if(!request) {
            const error = Error('invalid request');
            error.statusCode = 404;
            throw error; 
        }

        patchedRequest = request;
        return;
    })
    .then(() => { 
        return Request.setApprovedState(requestID, approved);
    })
    .then(() => {
        return Vehicle.requestUpdate(patchedRequest.vehicle._id, false, patchedRequest.expires_at, true);
    })
    .then(() => {
        if(approved) {
            return Route.updateTrips(patchedRequest.route._id); 
        } 
        return;
    })
    .then(() => {
        if(approved) {
            console.log(req.user);
            return User.requestUpdate(patchedRequest.user._id, patchedRequest.expires_at, Number(req.user.trips) + 1);
        }
        return;
    })
    .then(() => {
        res.status(200).json({
            data:{
                request:patchedRequest
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