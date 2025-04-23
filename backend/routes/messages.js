const express = require('express');
const messagesController = require('../controllers/messages');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

// Get messages for a specific user
router.get('/:mobile', messagesController.getMessages);

// Send a message
router.post('/', messagesController.sendMessage);

module.exports = router;