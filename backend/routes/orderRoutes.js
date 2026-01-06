const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getMyOrders, 
  getSellerOrders, 
  updateOrderStatus,
  deleteOrderAdmin, 
  getAdminOrders,
  createOrderFromDesign
} = require('../controllers/orderController');

// Buyer Routes
router.post('/', protect, createOrder);        // Place an Order (from Cart items)
router.post('/design', protect, createOrderFromDesign); // Finalize custom design order
router.get('/my-orders', protect, getMyOrders); // View Buyer History

// Seller Routes
router.get('/seller-orders', protect, getSellerOrders); // View Seller Dashboard
router.put('/:id/status', protect, updateOrderStatus);  // Update Status (Triggers Notification)

// --- ADMIN ROUTES ---
router.get('/admin/all', protect, getAdminOrders); // NEW ADMIN VIEW ROUTE
router.delete('/admin/:id', protect, deleteOrderAdmin); // NEW ADMIN DELETE ROUTE

module.exports = router;