const asyncHandler = require('express-async-handler');
const Asset = require('../models/Asset');

// Helper to enforce Admin role
const checkAdmin = (req, res) => {
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Forbidden: Admin access required.');
    }
};

// @desc    Get All Assets (Admin/Public if filtered)
// @route   GET /api/assets
// @access  Public (filtered) / Private (all for Admin)
const getAssets = asyncHandler(async (req, res) => {
    // If not admin, only show available assets (for public use)
    const filter = req.user && req.user.role === 'admin' ? {} : { isAvailable: true }; 
    const assets = await Asset.find(filter).sort({ type: 1, name: 1 });
    res.json(assets);
});

// @desc    Create a New Asset
// @route   POST /api/assets
// @access  Private (Admin)
const createAsset = asyncHandler(async (req, res) => {
    checkAdmin(req, res);
    
    // The required fields now include metadata
    const { name, type, modelUrl, thumbnailUrl, priceModifier, isAvailable, metadata } = req.body; 

    if (!name || !type) {
        res.status(400);
        throw new Error('Please include name and type');
    }

    const asset = await Asset.create({
        name, type, modelUrl, thumbnailUrl, priceModifier, isAvailable, metadata 
    });

    res.status(201).json(asset);
});

// @desc    Update an Asset
// @route   PUT /api/assets/:id
// @access  Private (Admin)
const updateAsset = asyncHandler(async (req, res) => {
    checkAdmin(req, res);

    const asset = await Asset.findById(req.params.id);
    if (!asset) { res.status(404); throw new Error('Asset not found'); }

    // req.body automatically includes the updated fields, including metadata
    const updatedAsset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.json(updatedAsset);
});

// @desc    Delete an Asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin)
const deleteAsset = asyncHandler(async (req, res) => {
    checkAdmin(req, res);
    const asset = await Asset.findById(req.params.id);
    if (!asset) { res.status(404); throw new Error('Asset not found'); }
    await Asset.deleteOne({ _id: req.params.id });
    res.json({ message: 'Asset removed' });
});

module.exports = { getAssets, createAsset, updateAsset, deleteAsset };