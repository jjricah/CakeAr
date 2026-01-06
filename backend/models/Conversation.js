// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // ✅ CRITICAL FIX: Add the 'design' field
  design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DesignSubmission', // Must match the model name used for design submissions
    default: null // Allows for general, non-design-related chats (Direct Chats)
  },
  // ✅ FIX: Add lastMessage and lastMessageAt fields
  lastMessage: {
    type: String,
    trim: true,
    maxlength: 100,
    default: 'New conversation started.'
  },

  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  // You might also have a lastMessage field or other meta-data here
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);