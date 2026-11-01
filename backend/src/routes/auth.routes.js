const express = require('express');
const { login, register, googleAuth, getMe, changePassword } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/google', googleAuth);
router.get('/me', authenticateToken, getMe);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
