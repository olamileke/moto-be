const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const requests = require('../resources/requests');
const { body } = require('express-validator');
const driver  = require('../middlewares/driver');
const authorize = require('../middlewares/authorize');
const admin = require('../middlewares/admin');

router.post('/requests', authenticate, driver, [ body('vehicleID').isLength({ min:24 }),
body('routeID').isLength({ min:24 }), body('days').isNumeric() ], requests.post); 

router.get('/requests', authenticate, authorize, requests.get)

router.patch('/requests', authenticate, admin, [ body('requestID').isLength({ min:24 }) ] , requests.patch)

module.exports = router;