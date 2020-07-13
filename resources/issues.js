const Issue = require('../models/issue');
const Vehicle = require('../models/vehicle');
const { validationResult } = require('express-validator');
const app_url = require('../utils/config').app_url;
const per_page = require('../utils/config').per_page;

exports.post = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        const error = new Error('validation failed');
        error.statusCode = 422;
        error.errors = errors;
        throw error;
    }

    const title = req.body.title;
    const description = req.body.description;
    const vehicleID = req.body.vehicleID;
    const user = { _id:req.user._id, name:req.user.name, avatar:req.user.avatar };
    const picture = app_url + req.file.path.replace(/\\/g, '/');
    let issueVehicle;

    Vehicle.findByID(vehicleID)
    .then(vehicle => {
        if(!vehicle) {
            const error = new Error('vehicle does not exist');
            error.statusCode = 404;
            throw error;
        }

        issueVehicle = { _id:vehicle._id, model:vehicle.model, plate_number:vehicle.plate_number, picture:vehicle.picture };
        const issue = new Issue(title, description, user, issueVehicle, picture, null, Date.now())
        return issue.save();
    })
    .then(({ ops }) => {
        res.status(201).json({
            data:{
                issue:ops[0]
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
    const skip = (Number(page) - 1) * per_page;

    Issue.count(admin, req.user._id)
    .then(count => {
        total = count;
        return Issue.get(admin, req.user._id, skip, per_page)
    })
    .then(issues => {
        res.status(200).json({
            data:{
                issues:issues
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