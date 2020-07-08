const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const routes = require('../resources/routes');
const authenticate = require('../middlewares/authenticate');
const admin = require('../middlewares/admin');

router.post('/routes', authenticate, admin, [ body('name').isLength({ min:6 }), body('description').isLength({ min:40 }) ], routes.post);

router.get('/routes', authenticate, admin, routes.get);

module.exports = router;
