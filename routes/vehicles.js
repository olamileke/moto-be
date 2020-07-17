const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const admin = require('../middlewares/admin');
const authorize = require('../middlewares/authorize');
const vehicles = require('../resources/vehicles');
const vehicle = require('../resources/vehicle');
const multer = require('../middlewares/multer');

router.post('/vehicles', authenticate, admin, multer , [ body('model').isLength({ min:6 }),
                           body('image').custom((value, { req }) => {
                               if(!req.file.path) {
                                   return Promise.reject('image is required'); 
                               }

                               return true;
                           }),
                           body('plate_number').isLength({ min:9 }), vehicles.post ])
                           
router.get('/vehicles', authenticate, authorize, vehicles.get);

router.put('/vehicles/:vehicleID', authenticate, admin, multer, [ body('model').isLength({ min:6 }),
                                    body('plate_number').isLength({ min:9 }) ], vehicle.put)

router.patch('/vehicles/:vehicleID', authenticate, admin, vehicle.patch);

module.exports = router;