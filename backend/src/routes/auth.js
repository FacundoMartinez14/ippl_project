const express = require('express');
const router = express.Router();
const { login, refreshToken } = require('../controllers/authController');

router.post('/login', login);
router.post('/refresh-token', refreshToken);

module.exports = router; 