const express = require('express');
const router = express.Router();
const passordresets = require('../resources/passwordresets');

router.post('/passwords/reset', passordresets.post);

module.exports = router;