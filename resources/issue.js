const Issue = require('../models/issue');

exports.patch = (req, res, next) => {
    const issueID = req.params.issueID;
    let issueToPatch;
    
    Issue.findByID(issueID)
    .then(issue => {
        if(!issue) {
            const error = new Error('issue does not exist');
            error.statusCode = 404;
            throw error;
        }

        issueToPatch = issue;
        return Issue.markFixed(issue._id)
    })
    .then(() => {
        const issue = {...issueToPatch, fixed_at:Date.now()}
        res.status(200).json({
            data:{
                issue:issue
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