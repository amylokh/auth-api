const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth-controller');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/verify', AuthController.verify);
router.post('/refresh', AuthController.refresh);

module.exports = router;