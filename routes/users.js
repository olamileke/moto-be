const express = require('express');
const router = express.Router();
const admin = require('../middlewares/admin');
const authenticate = require('../middlewares/authenticate');
const multer = require('../middlewares/multer');
const { body } = require('express-validator');
const users = require('../resources/users');

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
              body('password').isLength({ min:8 })) ], users.post);   

router.get('/users', authenticate, admin, users.get);

router.patch('/users', authenticate, multer, users.patch);
              
module.exports = router;