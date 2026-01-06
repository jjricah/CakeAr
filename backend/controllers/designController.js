// backend/controllers/designController.js
const DesignSubmission = require('../models/DesignSubmission');
const Notification = require('../models/Notification');
const cloudinary = require('../utils/cloudinary');
// ✅ FIX: NEW IMPORTS for Chat Integration
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User'); // Import User model
const Baker = require('../models/Baker'); // Import Baker model

// @desc    Submit a new design for approval
// @route   POST /api/designs
// @access  Private (Buyer)
const submitDesign = async (req, res) => {
    try {
        const {
            bakerId,
            config,
            estimatedPrice,
            userNote,
            snapshotImage,
            targetDate,
            requestType
        } = req.body;

        let snapshotUrl = null;
        if (snapshotImage) {
            const uploadResult = await cloudinary.uploader.upload(snapshotImage, {
                folder: 'creake_designs',
            });
            snapshotUrl = uploadResult.secure_url;
        }

        const submission = await DesignSubmission.create({
            user: req.user._id,
            baker: bakerId || null,
            config,
            estimatedPrice,
            userNote,
            snapshotImage: snapshotUrl,
            targetDate,
            requestType
        });

        res.status(201).json(submission);

        // --- NEW: Notification Logic for Design Submissions ---
        try {
            if (requestType === 'direct' && bakerId) {
                // FIX: bakerId is the Baker Document ID. We need the User ID for the notification.
                const bakerDoc = await Baker.findById(bakerId);
                if (bakerDoc) {
                await Notification.create({
                    user: bakerDoc.user, // Notify the User associated with the Baker
                    type: 'design_request',
                    title: 'New Direct Design Request!',
                    message: `A buyer has sent you a direct custom cake design request.`,
                    relatedId: submission._id
                });
                }
            } else if (requestType === 'broadcast') {
                // Find all sellers (users with role 'seller')
                // Note: In a large-scale app, you might want to limit this or use a queue
                const sellers = await User.find({ role: 'seller' });
                
                // For each seller, create a notification
                for (const seller of sellers) {
                    await Notification.create({
                        user: seller._id,
                        type: 'design_request',
                        title: 'New Broadcast Design Request!',
                        message: `A new custom cake design request is available for quotation.`,
                        relatedId: submission._id
                    });
                }
            }
        } catch (notifError) {
            console.error("Error sending design submission notification:", notifError);
            // Continue even if notification fails, as submission is the primary goal
        }
        // --- END NEW Notification Logic ---
    } catch (error) {
        console.error("Submit Design Error:", error);
        if (error.http_code === 400) {
            return res.status(400).json({ message: "Image upload failed. Check Cloudinary configuration or image size." });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get designs for the logged-in Buyer
// @route   GET /api/designs/my-designs
// @access  Private (Buyer)
const getMyDesigns = async (req, res) => {
    try {
        const designs = await DesignSubmission.find({ user: req.user._id })
            .populate('baker', 'shopName')
            .sort({ createdAt: -1 });
        res.json(designs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get pending designs for a Seller
// @route   GET /api/designs/seller-inbox
// @access  Private (Seller)
const getSellerInbox = async (req, res) => {
    try {
        const designs = await DesignSubmission.find({
            $or: [
                // Find designs assigned directly to this seller (user)
                { baker: req.user._id },
                { baker: null }          // General inquiry
            ]
        })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json(designs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single design by ID
// @route   GET /api/designs/:id
// @access  Private (Buyer/Seller)
const getDesignById = async (req, res) => {
    try {
        // Populate the buyer (User) and the baker (User)
        const design = await DesignSubmission.findById(req.params.id)
            .populate('user', 'name email')
            .populate('baker', 'name email'); // Populate the baker's User document

        if (!design) {
            return res.status(404).json({ message: "Design not found" });
        }

        // Authorization: Must be the owner (Buyer) or the assigned Baker (Seller)
        const isOwner = design.user._id.toString() === req.user._id.toString();
        const isAssignedBaker = design.baker && design.baker._id.toString() === req.user._id.toString();
        
        if (!isOwner && !isAssignedBaker) {
            return res.status(403).json({ message: "Not authorized to view this design." });
        }

        // If a baker is assigned, fetch their shop details from the Baker collection
        let bakerProfile = null;
        if (design.baker) {
            bakerProfile = await Baker.findOne({ user: design.baker._id }).select('shopName payoutInfo');
        }

        // Combine the data for the response
        const responseData = {
            ...design.toObject(),
            bakerProfile: bakerProfile // Add the separate baker profile info
        };

        res.json(responseData);
    } catch (error) {
        console.error("Get Design By ID Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Edit an existing design request
// @route   PUT /api/designs/:id
// @access  Private (Buyer)
const editDesignRequest = async (req, res) => {
    try {
        const design = await DesignSubmission.findById(req.params.id);
        if (!design) return res.status(404).json({ message: "Design not found" });
        
        if (design.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this design." });
        }

        const { config, estimatedPrice, userNote, snapshotImage, targetDate } = req.body;
        
        if (config) design.config = config;
        if (estimatedPrice) design.estimatedPrice = estimatedPrice;
        if (userNote) design.userNote = userNote;
        if (targetDate) design.targetDate = targetDate;
        
        if (snapshotImage && snapshotImage.startsWith('data:image')) {
             const uploadResult = await cloudinary.uploader.upload(snapshotImage, {
                folder: 'creake_designs',
            });
            design.snapshotImage = uploadResult.secure_url;
        }
        
        await design.save();
        res.json(design);
    } catch (error) {
        console.error("Edit Design Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update status (Approve/Decline/Quote/Discussion)
// @route   PUT /api/designs/:id/status
// @access  Private (Seller)
const updateDesignStatus = async (req, res) => {
    try {
        const { status, finalPrice, bakerNote, shippingFee, paymentPreference, downpaymentAmount } = req.body;

        const design = await DesignSubmission.findById(req.params.id);
        if (!design) return res.status(404).json({ message: "Design not found" });

        if (design.baker && design.baker.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this design." });
        }

        // --- NEW: Handle "Release" action (Seller gives up the request) ---
        if (status === 'released') {
             if (design.requestType === 'broadcast') {
                 design.baker = null;
                 design.status = 'pending';
                 design.bakerNote = undefined; 
                 design.finalPrice = undefined;
                 await design.save();
                 return res.json(design);
             } else {
                 // If direct, released acts as declined
                 design.status = 'declined';
             }
        }

        // Update fields
        const isNewAssignment = !design.baker && status !== 'declined';

        design.status = status;
        if (finalPrice !== undefined) design.finalPrice = finalPrice;
        if (bakerNote !== undefined) design.bakerNote = bakerNote;
        // ✅ NEW: Save shipping and payment terms
        if (shippingFee !== undefined) design.shippingFee = shippingFee;
        if (paymentPreference !== undefined) design.paymentPreference = paymentPreference;
        // ✅ NEW: Save downpayment amount
        if (downpaymentAmount !== undefined) design.downpaymentAmount = downpaymentAmount;

        // Assign to seller if they claim a broadcast request (baker: null)
        if (isNewAssignment) {
            design.baker = req.user._id; // Assign the User ID of the seller
        }

        await design.save();

        // --- ✅ REFACTOR: Ensure a unique Conversation exists for this DesignSubmission ---
        let conversation = await Conversation.findOne({ design: design._id });

        // Only create a conversation if the design is now assigned to a baker
        if (!conversation && design.baker) {
            conversation = await Conversation.create({
                participants: [
                    design.user, // Buyer
                    design.baker  // Seller (as a User)
                ],
                design: design._id, // Link conversation directly to the design submission
                lastMessageAt: Date.now()
            });
        }
        // --- ------------------------------------------------------------------- ---

        // --- ✅ FIX: Handle Status-Specific Chat Messages for Discussion/Quotation ---
        if (conversation) {
            let messageText = '';
            let messageType = 'standard';
            let lastMessageText = '';

            if (status === 'quoted' && design.finalPrice) {
                messageText = `We are pleased to quote your custom cake design at **₱${design.finalPrice.toFixed(2)}**. ${bakerNote || ''} Please review and confirm.`;
                messageType = 'quotation';
                lastMessageText = `Quotation sent: ₱${design.finalPrice.toFixed(2)}`;
            } else if (status === 'discussion' || isNewAssignment) {
                // This is the key part to facilitate chat *before* quoting (Seller side fix)
                messageText = `I have started reviewing your design request (#${design._id.toString().slice(-4)}). Let's discuss the details further in this chat. ${bakerNote || 'What design aspect can I help clarify?'} `;
                messageType = 'standard';
                lastMessageText = isNewAssignment ? `New request assigned. Discussion started.` : `Discussion re-initiated by Baker.`;
            }

            // Only create a message if there is specific content for the status change
            if (messageText) {
                await Message.create({
                    conversationId: conversation._id,
                    sender: req.user._id, // Sender is the current user (the seller)
                    senderModel: 'User',
                    text: messageText,
                    designSubmission: design._id,
                    messageType: messageType
                });

                // Update conversation's last message for chat list view
                await Conversation.findByIdAndUpdate(conversation._id, {
                    lastMessage: lastMessageText,
                    lastMessageAt: Date.now()
                });
            }
        }
        // --- --------------------------------------------------------------------- ---

        // Create Notification (Wrapped in try/catch to be safe)
        try {
            // Notify the buyer of the status change
            await Notification.create({
                user: design.user,
                type: 'order_update',
                title: `Design Request Update`,
                message: `Status: ${status.toUpperCase()}. ${bakerNote ? `Note: ${bakerNote}` : ''}`,
                relatedId: design._id
            });
        } catch (notifErr) {
            console.log("Notification skipped:", notifErr.message);
        }

        res.json({
            ...design.toObject(),
            conversationId: conversation ? conversation._id : null
        });
    } catch (error) {
        console.error("Update Design Error:", error);
        // ✅ FIX: Ensures error message is sent to the frontend for debugging
        res.status(500).json({ message: error.message });
    }
};


// @desc    [BUYER ACTION] Approve a quoted design to proceed to ordering
// @route   POST /api/designs/:id/approve
// @access  Private (Buyer)
const approveDesignQuote = async (req, res) => {
    try {
        const design = await DesignSubmission.findById(req.params.id);

        if (!design) return res.status(404).json({ message: "Design not found" });
        if (design.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to approve this design." });
        }
        if (design.status !== 'quoted' || !design.finalPrice) {
            return res.status(400).json({ message: `Cannot approve design. Must be 'quoted' with a final price. Current status: ${design.status}.` });
        }

        // 1. Update Design Status
        design.status = 'approved';
        await design.save();

        // 2. Send Chat Notification to Seller
        if (design.baker) {
            // ✅ FIX: Use design ID for conversation lookup for consistency
            const conversation = await Conversation.findOne({ design: design._id });

            if (conversation) {
                await Message.create({
                    conversationId: conversation._id,
                    sender: req.user._id, // The buyer
                    text: `I have approved the quotation of ₱${design.finalPrice.toFixed(2)}. Ready to order!`,
                    designSubmission: design._id,
                    messageType: 'approval'
                });

                await Conversation.findByIdAndUpdate(conversation._id, {
                    lastMessage: `Design approved! Ready for order.`,
                    lastMessageAt: Date.now()
                });
            }
        }

        // 3. Create Notification for Seller 
        try {
            if (design.baker) {
                await Notification.create({
                    user: design.baker,
                    type: 'design_response',
                    title: `Design Quote Approved`,
                    message: `The buyer approved the quote (₱${design.finalPrice.toFixed(2)}) for Design #${design._id.toString().slice(-4)}.`,
                    relatedId: design._id
                });
            }
        } catch (notifErr) {
            console.log("Seller Notification skipped:", notifErr.message);
        }

        res.json(design);
    } catch (error) {
        console.error("Approve Design Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    [BUYER ACTION] Decline a quoted design
// @route   POST /api/designs/:id/decline
// @access  Private (Buyer)
const declineDesignQuote = async (req, res) => {
    try {
        const design = await DesignSubmission.findById(req.params.id);

        if (!design) return res.status(404).json({ message: "Design not found" });
        if (design.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to decline this design." });
        }
        if (design.status !== 'quoted' && design.status !== 'discussion') {
            return res.status(400).json({ message: `Cannot decline design in status: ${design.status}.` });
        }

        // 1. Update Design Status
        // If it was a broadcast request, releasing it back to the pool allows other sellers to pick it up
        if (design.requestType === 'broadcast') {
            design.status = 'pending';
            design.baker = null;
            design.finalPrice = undefined;
        } else {
            design.status = 'declined';
        }
        await design.save();

        // 2. Send Chat Notification to Seller
        if (design.baker) {
            // ✅ FIX: Use design ID for conversation lookup for consistency
            const conversation = await Conversation.findOne({ design: design._id });

            if (conversation) {
                await Message.create({
                    conversationId: conversation._id,
                    sender: req.user._id, // The buyer
                    text: `I have declined the quotation for this design.`,
                    designSubmission: design._id,
                    messageType: 'declined'
                });

                await Conversation.findByIdAndUpdate(conversation._id, {
                    lastMessage: `Design declined.`,
                    lastMessageAt: Date.now()
                });
            }
        }

        // 3. Create Notification for Seller 
        try {
            if (design.baker) {
                await Notification.create({
                    user: design.baker,
                    type: 'design_response',
                    title: `Design Quote Declined`,
                    message: `The buyer declined the quote for Design #${design._id.toString().slice(-4)}.`,
                    relatedId: design._id
                });
            }
        } catch (notifErr) {
            console.log("Seller Notification skipped:", notifErr.message);
        }

        res.json(design);
    } catch (error) {
        console.error("Decline Design Error:", error);
        res.status(500).json({ message: error.message });
    }
};


// ✅ FIX: EXPORT ALL REQUIRED FUNCTIONS
module.exports = {
    submitDesign,
    getMyDesigns,
    getSellerInbox,
    updateDesignStatus,
    approveDesignQuote,
    declineDesignQuote,
    editDesignRequest,
    getDesignById
};