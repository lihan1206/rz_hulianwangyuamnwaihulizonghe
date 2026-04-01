const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validate, loginValidation } = require('../middleware/validator');

router.post('/login', validate(loginValidation), AuthController.login);

module.exports = router;
