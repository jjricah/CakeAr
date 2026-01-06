const Review = require('../models/Review');
const Order = require('../models/Order');
const Baker = require('../models/Baker');
const mongoose = require('mongoose');

// Helper to update aggregate seller rating
const updateSellerRating = async (sellerId) => {
    const stats = await Review.aggregate([
        { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
        { $group: {
            _id: '$seller',
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
        }}
    ]);

    if (stats.length > 0) {
        await Baker.findOneAndUpdate(
            { user: sellerId },
            { 
                rating: stats[0].averageRating.toFixed(1),
                numReviews: stats[0].totalReviews
            }
        );
    }
};

// @desc    Submit a new review for a completed order
// @route   POST /api/reviews
// @access  Private (Buyer)
const submitReview = async (req, res) => {
    try {
        const { orderId, rating, comment, image } = req.body;
        const buyerId = req.user._id;

        // 1. Validate Order Status and Ownership
        const order = await Order.findById(orderId);
        if (!order || order.buyer.toString() !== buyerId.toString()) {
            return res.status(404).json({ message: 'Order not found or not owned by user.' });
        }
        if (order.orderStatus !== 'completed') {
            return res.status(400).json({ message: 'Only completed orders can be reviewed.' });
        }
        
        // Assume first item baker is the primary seller
        const sellerId = order.items[0]?.baker;
        if (!sellerId) {
             return res.status(400).json({ message: 'Order has no associated seller.' });
        }
        
        // 2. Create the Review
        const review = await Review.create({
            buyer: buyerId,
            seller: sellerId,
            order: orderId,
            rating,
            comment,
            // Assuming image handling is implemented elsewhere (like base64 upload)
            image: image || null,
            product: order.items[0]?.product || null 
        });

        // 3. Update Seller's Aggregate Rating
        await updateSellerRating(sellerId);

        res.status(201).json(review);
    } catch (error) {
        // Handle duplicate review errors (unique index constraint)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already reviewed this order.' });
        }
        console.error('Submit Review Error:', error);
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .populate('buyer', 'name') // Show reviewer name
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Check if order is reviewable (for UI button toggle)
// @route   GET /api/reviews/check/:orderId
// @access  Private (Buyer)
const checkReviewable = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.buyer.toString() !== req.user._id.toString() || order.orderStatus !== 'completed') {
            return res.json({ canReview: false });
        }
        
        const existingReview = await Review.findOne({ order: req.params.orderId });
        if (existingReview) {
            return res.json({ canReview: false, reviewed: true });
        }

        return res.json({ canReview: true });
    } catch (error) {
        res.status(500).json({ canReview: false });
    }
};

module.exports = { submitReview, getProductReviews, checkReviewable };