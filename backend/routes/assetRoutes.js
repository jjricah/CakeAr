const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    getAssets, createAsset, updateAsset, deleteAsset 
} = require('../controllers/assetController');

// Public route to fetch (available) assets 
router.get('/', getAssets);

// Admin-only routes (protected by checkAdmin inside controller)
router.post('/', protect, createAsset);
router.put('/:id', protect, updateAsset);
router.delete('/:id', protect, deleteAsset);

module.exports = router;