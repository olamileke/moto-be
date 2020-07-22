const express = require('express');
const router = express.Router();
const auth = require('../resources/auth.js');
const { body } = require('express-validator');

router.post('/authenticate', [ body('email').isEmail(), body('password').isLength({ min:8 })]  , auth.post);

module.exports = router; 