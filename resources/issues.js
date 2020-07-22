const Issue = require('../models/issue');
const Vehicle = require('../models/vehicle');
const Request = require('../models/request');
const { validationResult } = require('express-validator');
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

    const title = req.body.title;
    const description = req.body.description;
    const user = { _id:req.user._id, name:req.user.name, avatar:req.user.avatar };

    Request.checkActiveDriver(req.user._id)
    .then(requests => {
        if(!requests[0]) {
            const error = new Error('this driver is currently not active');
            error.statusCode = 403;
            throw error;
        }

        if(requests[0] && requests[0].pending) {
            const error = new Error('this driver only has a current pending request');
            error.statusCode = 403;
            throw error;
        }

        if(requests[0] && !requests[0].pending && requests[0].approved && requests[0].expires_at <= Date.now()) {
            const error = new Error('this driver is currently not active');
            error.statusCode = 403;
            throw error;
        }

        file.upload(req, res, next, 'issues', picture => {

            const issue = new Issue(title, description, user, requests[0].vehicle, picture, null, Date.now())
            return issue.save()
            .then(({ ops }) => {
                res.status(201).json({
                    data:{
                        issue:ops[0]
                    }
                })
            })
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
    let page, total;
    req.query.page ? page = req.query.page : page = 1;
    const skip = (Number(page) - 1) * (per_page + 1);

    Issue.count(req.user.admin, req.user._id)
    .then(count => {
        total = count;
        return Issue.get(req.user.admin, req.user._id, skip, per_page + 1) 
    })
    .then(issues => {
        res.status(200).json({
            data:{
                issues:issues,
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