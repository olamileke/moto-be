const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const routes = require('../resources/routes');
const route = require('../resources/route');
const authenticate = require('../middlewares/authenticate');
const admin = require('../middlewares/admin');

router.post('/routes', authenticate, admin, [ body('name').isLength({ min:6 }), body('description').isLength({ min:40 }) ], routes.post);

router.get('/routes', authenticate, routes.get);

router.put('/routes/:routeID', authenticate, admin, [ body('name').isLength({ min:6 }), body('description').isLength({ min:40 }) ], route.put)

module.exports = router;
