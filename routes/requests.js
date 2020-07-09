const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const requests = require('../resources/requests');
const { body } = require('express-validator');

router.post('/requests', authenticate, [ body('vehicleID').isLength({ min:24 }),
                                         body('routeID').isLength({ min:24 }),
                                         body('days').isNumeric() ], requests.post);

module.exports = router;