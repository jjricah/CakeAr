const express = require('express');
const router = express.Router();

const { 
  createProduct, 
  getSellerProducts, 
  getAllProducts, 
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  // 1. Import the new admin controller function
  deleteProductAdmin 
} = require('../controllers/productController');

// 2. Import the new admin middleware
const { protect, admin } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES ---
router.get('/', getAllProducts);


// --- PROTECTED ROUTES (SELLER/USER) ---
// ✅ IMPORTANT: Specific routes MUST come before dynamic /:id routes
router.get('/seller', protect, getSellerProducts);
router.post('/', protect, createProduct);


// --- PROTECTED ROUTES (ADMIN) ---
// 3. Add the new admin-only delete route, protected by 'protect' AND 'admin'
router.delete('/admin/:id', protect, admin, deleteProductAdmin); 
// 4. Update the Admin GET route to also use the 'admin' middleware
router.get('/admin/all', protect, admin, getAllProductsAdmin); 


// --- PROTECTED ROUTES (SELLER/USER) ---
router.put('/:id', protect, updateProduct);
// This original delete route remains for the seller
router.delete('/:id', protect, deleteProduct);


// --- PUBLIC ROUTES (Dynamic ID) ---
router.get('/:id', getProductById);

module.exports = router;