const asyncHandler = require('express-async-handler');
const Baker = require('../models/Baker');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary'); // Import cloudinary utility

// @desc    Register a new shop (Upgrade user to seller)
// @route   POST /api/shop/register
// @access  Private
const registerShop = asyncHandler(async (req, res) => {
  // Data comes as application/json now
  const { shopName, shopDescription, specialties, address, payoutInfo, shopLogo } = req.body;
  const userId = req.user._id;
  
  // --- Validation ---
  if (!shopName || shopName.trim() === '') {
    res.status(400);
    throw new Error('Shop Name is required to register as a Baker.');
  }
  const existingBaker = await Baker.findOne({ user: userId });
  if (existingBaker) {
    res.status(400);
    throw new Error('This user is already registered as a Baker.');
  }
  const shopNameExists = await Baker.findOne({ shopName: shopName.trim() });
  if (shopNameExists) {
    res.status(400);
    throw new Error('That shop name is already taken. Please choose another one.');
  }

  let shopLogoUrl = '';
  // --- Handle Base64 Image Upload ---
  if (shopLogo && shopLogo.startsWith('data:image')) {
    try {
      const uploadRes = await cloudinary.uploader.upload(shopLogo, {
        folder: 'creake_shop_logos'
      });
      shopLogoUrl = uploadRes.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary Upload Error on Registration:", uploadError);
      res.status(500);
      throw new Error('Image upload failed. Please try a smaller file or a different image.');
    }
  }

  // Create the new Baker profile
  const baker = await Baker.create({
    user: userId,
    shopName: shopName.trim(),
    shopDescription,
    specialties,
    address,
    payoutInfo,
    shopLogo: shopLogoUrl,
  });

  // Update the User's role
  const user = await User.findById(userId);
  if (user) {
    user.role = 'seller';
    user.shopName = baker.shopName; 
    await user.save();
  }

  if (baker && user) {
    res.status(201).json({
      message: 'Baker profile successfully registered.',
      shop: baker,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: baker.shopName 
      }
    });
  } else {
    res.status(400);
    throw new Error('Invalid shop data received or user not found.');
  }
});

// @desc    Get current shop profile
// @route   GET /api/shop/me
// @access  Private
const getMyShopProfile = asyncHandler(async (req, res) => {
  const baker = await Baker.findOne({ user: req.user._id });
  if (baker) {
    res.json({ shop: baker });
  } else {
    res.status(404);
    throw new Error('Baker profile not found for this user.');
  }
});

// @desc    Update shop profile
// @route   PUT /api/shop/me
// @access  Private
const updateShopProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { shopName, shopDescription, specialties, address, payoutInfo, shopLogo } = req.body;
  
  const shop = await Baker.findOne({ user: userId });
  if (!shop) {
    res.status(404);
    throw new Error('Shop profile not found.');
  }

  // Handle shopName update
  if (shopName && shopName.trim() !== shop.shopName) {
    const shopNameExists = await Baker.findOne({ shopName: shopName.trim() });
    if (shopNameExists) {
      res.status(400);
      throw new Error('That shop name is already taken. Please choose another one.');
    }
    shop.shopName = shopName.trim();
    await User.findByIdAndUpdate(userId, { shopName: shop.shopName });
  }

  // --- Handle Base64 Image Upload ---
  if (shopLogo && shopLogo.startsWith('data:image')) {
    try {
      const uploadRes = await cloudinary.uploader.upload(shopLogo, {
        folder: 'creake_shop_logos'
      });
      shop.shopLogo = uploadRes.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary Upload Error on Update:", uploadError);
      res.status(500);
      throw new Error('Image upload failed. Please try a smaller file.');
    }
  } else if (shopLogo === null) {
    shop.shopLogo = ''; // Allow removing the logo
  }

  // Update other fields
  if (shopDescription !== undefined) shop.shopDescription = shopDescription;
  if (specialties !== undefined) shop.specialties = specialties;
  if (payoutInfo !== undefined) shop.payoutInfo = payoutInfo;
  if (address !== undefined) shop.address = address;

  const updatedShop = await shop.save();
  const updatedUser = await User.findById(userId).select('-password');

  res.status(200).json({
    message: 'Shop profile successfully updated.',
    shop: updatedShop,
    user: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      shopName: updatedShop.shopName,
    }
  });
});

// @desc    Get a public shop profile by Baker ID
// @route   GET /api/shop/profile/:bakerId
// @access  Public
const getShopProfile = asyncHandler(async (req, res) => {
    const baker = await Baker.findOne({ user: req.params.bakerId })
        .populate('user', 'name email'); 

    if (!baker) {
        res.status(404);
        throw new Error('Shop profile not found.');
    }

    res.json(baker);
});

// @desc    Get all registered sellers (shops)
// @route   GET /api/shop/all-sellers
// @access  Public
const getAllSellers = asyncHandler(async (req, res) => {
    const sellers = await Baker.find({})
        .select('_id shopName shopLogo rating')
        .sort('shopName');

    if (!sellers) {
        res.status(404);
        throw new Error('No sellers found.');
    }

    res.json(sellers);
});

module.exports = {
  registerShop,
  getMyShopProfile,
  updateShopProfile,
  // updateShopLogo is now removed
  getShopProfile,
  getAllSellers
};