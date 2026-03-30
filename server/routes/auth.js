const express = require('express');
const { auth } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

// POST /api/auth/register — Create new account
router.post('/register', register);

// POST /api/auth/login — Login with email + password
router.post('/login', login);

// GET /api/auth/me — Get current user (Protected)
router.get('/me', auth, getMe);

module.exports = router;
