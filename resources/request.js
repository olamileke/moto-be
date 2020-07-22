const Request = require('../models/request');
const Vehicle = require('../models/vehicle');
const Route = require('../models/route');
const User = require('../models/user');

exports.patch = (req, res, next) => {

    const requestID = req.params.requestID;
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
        return Request.setApprovedState(requestID, approved);
    })
    .then(() => {
        return Vehicle.requestUpdate(patchedRequest.vehicle._id, false, patchedRequest.expires_at, true);
    })
    .then(() => {
        if(approved) {
            return Route.updateTrips(patchedRequest.route._id)
            .then(() => {
                return User.requestUpdate(patchedRequest.user._id, patchedRequest.expires_at, patchedRequest.user.trips + 1);
            })
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