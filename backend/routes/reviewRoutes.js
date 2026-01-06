const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  submitReview, 
  getProductReviews,
  checkReviewable
} = require('../controllers/reviewController');

// Buyer/Private Routes
router.post('/', protect, submitReview);
router.get('/check/:orderId', protect, checkReviewable);

// Public Routes
router.get('/product/:productId', getProductReviews);

module.exports = router;