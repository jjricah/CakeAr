// backend/routes/chatRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); 
const { 
    startConversation, 
    startDirectConversation,
    getConversations, 
    getMessages, 
    sendMessage 
} = require('../controllers/chatController'); 


// 1. Get All Conversations (Load initial chat list)
// @route GET /api/chat
router.get('/', protect, getConversations); 

// 2. Start Design-Linked Conversation
// @route POST /api/chat/start
router.post('/start', protect, startConversation); 

// 3. Start Direct Conversation (From Shop Profile)
// @route POST /api/chat/direct
router.post('/direct', protect, startDirectConversation); 


// 4. Get Messages for a specific conversation
// @route GET /api/chat/:conversationId/messages
router.get('/:conversationId/messages', protect, getMessages);


// 5. Send Message 
// @route POST /api/chat/:conversationId/messages
router.post('/:conversationId/messages', protect, sendMessage);


module.exports = router;