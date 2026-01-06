const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllCustomers,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuth');

// All routes require authentication and admin privileges
router.use(protect);
router.use(adminAuth);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Customer management
router.get('/customers', getAllCustomers);

// Order management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/payment', updateOrderPayment);
router.delete('/orders/:id', deleteOrder);

// Product management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Category management
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

module.exports = router;
