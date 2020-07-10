const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const app_url = require('../utils/config').app_url;

exports.post = (req, res, next) => {

    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        throw error;
    }

    const model = req.body.model;
    const plate_number = req.body.plate_number;
    const picture = app_url + req.file.path.replace(/\\/g, '/');

    const new_vehicle = new Vehicle(model, plate_number, picture, 0, false, Date.now(), Date.now());

    Vehicle.findByPlateNumber(plate_number)
    .then(vehicle => {
        if(vehicle) {
            const error = new Error('vehicle with plate number exists');
            error.statusCode = 403;
            throw error;
        }
        return new_vehicle.save();
    })
    .then(({ op }) => {
        res.status(201).json({
            data:{
                vehicle:op
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
    let admin;
    req.query.admin == 'true' ? admin = true : admin = false;

    Vehicle.get(admin) 
    .then(vehicles => { 
        res.status(200).json({
            data:{
                vehicles:vehicles
            }
        })
    })
    .catch(err => {
        err.statusCode = 500;
        next(err);
    })
}