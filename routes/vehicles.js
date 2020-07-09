const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const admin = require('../middlewares/admin');
const vehicles = require('../resources/vehicles');
const multer = require('../middlewares/multer');

router.post('/vehicles', authenticate, admin, multer , [ body('model').isLength({ min:6 }),
                           body('image').custom((value, { req }) => {
                               if(!req.file.path) {
                                   return Promise.reject('image is required');
                               }

                               return true;
                           }),
                           body('plate_number').isLength({ min:7 }), vehicles.post ])
                           
router.get('/vehicles', authenticate, admin, vehicles.get);

module.exports = router;