const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const app_url = require('../utils/config').app_url;
const per_page = require('../utils/config').per_page;
const file = require('../utils/file');

exports.post = (req, res, next) => {

    const errors = validationResult(req);
 
    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const model = req.body.model.toLowerCase();
    const plate_number = req.body.plate_number.toLowerCase();

    file.upload(req, res, next, 'vehicles', picture => {
        Vehicle.findByPlateNumber(plate_number)
        .then(vehicle => {
            if(vehicle) {
                const error = new Error('vehicle with plate number exists');
                error.statusCode = 403;
                throw error;
            }
            const new_vehicle = new Vehicle(model, plate_number, picture, 0, true, false, Date.now(), Date.now());
            return new_vehicle.save();
        })
        .then(({ ops }) => {
            res.status(201).json({
                data:{
                    vehicle:ops[0]
                }
            }) 
        })
        .catch(err => {
            if(!err.statusCode) {
                err.statusCode = 500;
            }

            next(err);
        }) 
    })
}

exports.get = (req, res, next) => {
    let page, total;
    req.query.page ? page = req.query.page : page = 1;
    const skip = (page - 1) * per_page;

    Vehicle.count(req.user.admin)
    .then(count => {
        total = count;
        return Vehicle.get(req.user.admin, skip, per_page)
    })
    .then(vehicles => { 
        res.status(200).json({
            data:{
                vehicles:vehicles,
                total:total
            }
        })
    })
    .catch(err => {
        err.statusCode = 500;
        next(err);
    })
}