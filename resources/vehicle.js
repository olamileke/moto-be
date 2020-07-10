const Vehicle = require('../models/vehicle');
const Request = require('../models/request');
const { validationResult } = require('express-validator');
const app_url = require('../utils/config').app_url;
const file = require('../utils/file');

exports.put = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
    }

    const vehicleID = req.params.vehicleID;
    const model = req.body.model;
    const plate_number = req.body.plate_number;
    let oldVehicle, updatedVehicle, picture;
    req.file.path ? picture = app_url + req.file.path.replace(/\\/g, '/') : '';

    Vehicle.findByID(vehicleID)
    .then(vehicle => {
        if(!vehicle) {
            const error = new Error('vehicle does not exist');
            error.statusCode = 404;
            throw error;
        }

        oldVehicle = vehicle;
        return Request.checkActiveVehicle(vehicleID)
    })
    .then(request => {
        if(request && request.pending) {
            const error = new Error('there is a pending request for this vehicle');
            error.statusCode = 403;
            throw error;
        }

        if(request && !request.pending && request.approved) {
            const error = new Error('this vehicle is on an active operation');
            error.statusCode = 403;
            throw error;
        }

        picture ? file.delete(oldVehicle.picture) : '';
        return Vehicle.update(vehicleID, model, plate_number, picture)
    })
    .then(vehicle => {
        updatedVehicle = vehicle;
        delete vehicle.trips;
        delete vehicle.pending;
        delete vehicle.reserved_till;
        delete vehicle.created_at;
        return Request.updateVehicle(vehicle);
    })
    .then(() => {
        res.status(200).json({
            data:{
                vehicle:updatedVehicle
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