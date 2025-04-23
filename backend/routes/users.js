const express = require('express');
const usersController = require('../controllers/users');
const authMiddleware = require('../middleware/auth');

const router = express.Router();



// Get user by mobile number
router.get('/:mobile', authMiddleware, usersController.findByMobile);

// Get all chats for current user
router.get('/chats/all', authMiddleware, usersController.getChats);

module.exports = router;