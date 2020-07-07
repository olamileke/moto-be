const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const user = require('../resources/user');

router.post('/users', [ body('name')
              .isLength({ min:6 })
              .custom(( value, {req} ) => {
                  const [fname, lname] = value.split(' ');

                  if(!lname) {
                    return Promise.reject('first and last names are required'); 
                  }

                  return true;
              }, 
              body('email').isEmail(),
              body('password').isLength({ min:8 })) ], user.post);   
              
module.exports = router;