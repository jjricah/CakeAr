const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    senderModel: { type: String, enum: ['User', 'Baker'], default: 'User' }, // Kept for potential backward compatibility, but new logic will only use 'User'
    text: { type: String }, 
    image: { type: String }, 
    read: { type: Boolean, default: false },
    designSubmission: { type: mongoose.Schema.Types.ObjectId, ref: 'DesignSubmission', default: null }, 
    messageType: { 
        type: String, 
        enum: ['standard', 'quotation', 'approval', 'declined'], 
        default: 'standard' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);