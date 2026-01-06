// backend/controllers/chatController.js
const User = require('../models/User');
const Baker = require('../models/Baker');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const DesignSubmission = require('../models/DesignSubmission');
const cloudinary = require('../utils/cloudinary');

// Helper to find or create a conversation linked to a design
const findOrCreateConversation = async (designId, buyerId, sellerId) => {
    // Attempt to find an existing conversation for this design/users
    let conversation = await Conversation.findOne({
        design: designId,
        participants: { $all: [buyerId, sellerId] }
    });

    if (!conversation) {
        // If not found, create a new one
        conversation = await Conversation.create({
            design: designId,
            participants: [buyerId, sellerId]
        });
    }
    return conversation;
};


// @desc    Start/Find a conversation based on Design ID (Buyer/Seller flow)
// @route   POST /api/chats/start
// @access  Private (Buyer/Seller)
const startConversation = async (req, res) => {
    try {
        const { designId } = req.body;
        const design = await DesignSubmission.findById(designId).select('user baker').populate('baker', 'name'); // baker is a User
        
        if (!design || !design.baker) {
            return res.status(404).json({ message: "Design not found or no baker assigned yet. Cannot start chat." });
        }
        
        // Authorization check: Must be the buyer or the assigned baker
        if (design.user.toString() !== req.user._id.toString() && design.baker._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to access this design chat." });
        }

        const conversation = await findOrCreateConversation(designId, design.user, design.baker._id);

        res.status(200).json({ 
            conversationId: conversation._id,
            designId: design._id,
            otherUser: design.baker.name || 'Baker',
            otherUserId: design.baker._id
        });

    } catch (error) {
        console.error("Start Conversation Error:", error);
        res.status(500).json({ message: "Failed to start conversation." });
    }
};

// @desc    Start/Find a direct conversation (not linked to a design)
// @route   POST /api/chats/direct
// @access  Private (Buyer/Seller)
const startDirectConversation = async (req, res) => {
    try {
        const { recipientId } = req.body; // recipientId is a User ID
        
        if (!recipientId || recipientId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "Invalid recipient ID." });
        }
        
        // 1. Check if conversation exists (Crucial: filter for conversations NOT linked to a design)
        let conversation = await Conversation.findOne({
            design: null, 
            participants: { $all: [req.user._id, recipientId] }
        });

        if (!conversation) {
            // 2. Create a new direct chat conversation
            conversation = await Conversation.create({
                design: null, 
                participants: [req.user._id, recipientId]
            });
        }
        
        // 3. Get recipient info for frontend display
        const recipient = await User.findById(recipientId).select('name');
        const bakerProfile = await Baker.findOne({ user: recipientId }).select('shopName');

        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found." });
        }

        res.status(200).json({ 
            conversationId: conversation._id,
            otherUser: bakerProfile?.shopName || recipient.name || 'User',
            otherUserId: recipientId
        });

    } catch (error) {
        console.error("Start Direct Conversation Error:", error);
        res.status(500).json({ message: "Failed to start direct conversation." });
    }
};

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chats
// @access  Private (Buyer/Seller)
const getConversations = async (req, res) => {
    try {
        const myId = req.user._id;

        const conversations = await Conversation.find({ 
            participants: myId
        })
            // Populate essential design data for display
            .populate('design', 'snapshotImage estimatedPrice status') 
            // Populate the other participant's info (excluding self)
            .populate('participants', 'name') 
            .sort({ updatedAt: -1 });

        // Structure conversations for easy frontend consumption
        const structuredConversations = await Promise.all(conversations.map(async (conv) => {
            // Find the participant that is NOT me
            const otherParticipant = conv.participants.find(p => p && p._id.toString() !== myId.toString());
            let otherUserName = 'User';
            if (otherParticipant) {
                const bakerProfile = await Baker.findOne({ user: otherParticipant._id }).select('shopName');
                otherUserName = bakerProfile?.shopName || otherParticipant.name;
            }
            
            return {
                _id: conv._id,
                design: conv.design,
                // ✅ FIX 1: Include the lastMessageAt and lastMessage fields
                lastMessageAt: conv.lastMessageAt,
                lastMessage: conv.lastMessage, 

                otherUser: otherUserName,
                otherUserId: otherParticipant ? otherParticipant._id : null
            };
        }));

        res.status(200).json(structuredConversations);
    } catch (error) {
        console.error("Get Conversations Error:", error);
        res.status(500).json({ message: "Failed to fetch conversations." });
    }
};


// @desc    Get messages for a specific conversation
// @route   GET /api/chats/:conversationId/messages
// @access  Private (Buyer/Seller)
const getMessages = async (req, res) => {
    try {
        const conversationId = req.params.conversationId;

        // 1. Verify the user is a participant
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        // Check if the current user (as User) OR their Shop (as Baker) is a participant
        const userId = req.user._id.toString();

        const isParticipant = conversation.participants.some(p => p && p.toString() === userId);

        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized to view this conversation." });
        }

        // 2. Fetch messages
        const messages = await Message.find({ conversationId: conversationId })
            .populate('sender', 'name') // Populate the User model
            .sort({ createdAt: 1 }); // Ascending order (oldest first)

        // 3. Augment sender with shopName if they are a seller
        const populatedMessages = await Promise.all(messages.map(async (msg) => {
            const msgObj = msg.toObject();
            if (msgObj.sender) {
                const bakerProfile = await Baker.findOne({ user: msgObj.sender._id }).select('shopName');
                if (bakerProfile) {
                    msgObj.sender.shopName = bakerProfile.shopName;
                }
            }
            return msgObj;
        }));

        res.status(200).json(populatedMessages);
    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({ message: "Failed to fetch messages." });
    }
};

// @desc    Send a new message
// @route   POST /api/chats/:conversationId/messages
// @access  Private (Buyer/Seller)
const sendMessage = async (req, res) => {
    try {
        const { content, image } = req.body;
        
        const convIdParam = req.params.conversationId; 
        
        console.log("Attempting to create message for Conversation ID:", convIdParam); 

        if (!convIdParam) {
             return res.status(400).json({ message: "Conversation ID is missing in the request URL parameters. Cannot send message." });
        }
        
        const conversation = await Conversation.findById(convIdParam); 
        
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const userId = req.user._id.toString();

        // Check if the sender is a participant
        if (!conversation.participants.some(p => p && p.toString() === userId)) {
            return res.status(403).json({ message: "Not authorized to send messages in this conversation." });
        }

        let imageUrl = null;
        if (image) {
            // Assuming your cloudinary utility is available
            const uploadRes = await cloudinary.uploader.upload(image, { folder: 'creake_chat' });
            imageUrl = uploadRes.secure_url;
        }

        const newMessage = await Message.create({
            // ✅ FIX: Use 'conversationId' field name from your Mongoose schema
            conversationId: convIdParam, 
            sender: req.user._id, // Sender is always the User
            senderModel: 'User',
            text: content || '', // Maps client's 'content' to schema's 'text'
            image: imageUrl,
        });

        // 4. Update Conversation 
        conversation.lastMessage = content || (image ? 'Sent an image.' : '...');
        conversation.lastMessageAt = new Date();
        conversation.updatedAt = new Date();
        await conversation.save();

        // 5. Populate and return
        const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name').lean();

        // Augment with shopName for the response to the client
        if (populatedMessage.sender) {
            const bakerProfile = await Baker.findOne({ user: populatedMessage.sender._id }).select('shopName');
            if (bakerProfile) {
                populatedMessage.sender.shopName = bakerProfile.shopName;
            }
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ message: "Failed to send message." });
    }
};


module.exports = {
    startConversation,
    startDirectConversation,
    getConversations,
    getMessages,
    sendMessage,
};