const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  submitDesign, 
  getMyDesigns, 
  getSellerInbox, 
  updateDesignStatus,
  approveDesignQuote, 
  declineDesignQuote,
  editDesignRequest,
  getDesignById
} = require('../controllers/designController');

// Buyer Routes
router.post('/', protect, submitDesign);
router.get('/my-designs', protect, getMyDesigns);

// Seller Routes
router.get('/seller-inbox', protect, getSellerInbox);

// Buyer action routes
router.post('/:id/approve', protect, approveDesignQuote); // Buyer confirms quote
router.post('/:id/decline', protect, declineDesignQuote); // Buyer declines quote

// Dynamic routes (must be last)
router.put('/:id/status', protect, updateDesignStatus);
router.put('/:id', protect, editDesignRequest); // Edit Design
router.get('/:id', protect, getDesignById); // Get Single Design (For Quotes/Checkout)

module.exports = router;