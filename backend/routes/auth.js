const express = require('express');
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp); // 👈 Add this

// Protected route - verify token
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;