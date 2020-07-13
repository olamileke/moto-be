const express = require('express');
const router = express.Router();
const driver = require('../middlewares/driver');
const multer = require('../middlewares/multer');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const { body } = require('express-validator');
const issues = require('../resources/issues');

router.post('/issues', authenticate, multer, [ body('title').isLength({ min:8 }), body('vehicleID').isLength({ min:24 }),
                    body('description').isLength({ min:80 }), body('image').custom((value, { req }) => {
                        if(!req.file) {
                            return Promise.reject('image is required');
                        }
                        return true;                        
                    }) ], issues.post);

router.get('/issues', authenticate, authorize, issues.get);

module.exports = router;