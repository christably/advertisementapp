const express = require('express');
const {signUp, logIn} = require('../Controllers/authController');
const {validateSignUp, validateLogin} = require('../Middlewares/validation');


const router = express.Router();

// endpoint for when a user wants to sign up
// validateSignUp runs first to check if the data is valid, then signUp creates the account
router.post('/signUp', validateSignUp, signUp);

// endpoint for when a user wants to log in  
// validateLogin checks if email/password are provided, then logIn verifies credentials
router.post('/logIn', validateLogin, logIn);

module.exports = router;