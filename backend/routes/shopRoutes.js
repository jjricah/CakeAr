const express = require('express');
const router = express.Router();

// Upload middleware is no longer needed here as we are using Base64 strings
// const { upload } = require('../middleware/uploadMiddleware'); 

const { 
  registerShop, 
  getMyShopProfile, 
  updateShopProfile,
  // updateShopLogo is removed
  getShopProfile,
  getAllSellers
} = require('../controllers/shopController');

const { protect } = require('../middleware/authMiddleware');

// Register Shop - Now accepts application/json
router.post('/register', protect, registerShop);

// Get My Profile (Private)
router.get('/me', protect, getMyShopProfile);

// Update My Profile (Private) - Now accepts application/json with optional Base64 image
router.put('/me', protect, updateShopProfile);

// The dedicated logo update route is no longer needed.
// router.put('/me/logo', protect, upload.single('shopLogo'), updateShopLogo);

// This route will handle the /api/shop/profile/:bakerId request
router.get('/profile/:bakerId', getShopProfile); 

// New route to get all sellers
router.get('/all-sellers', getAllSellers);

module.exports = router;