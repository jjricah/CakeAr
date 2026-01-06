const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const { updateProfile, deleteUser, getAdminSummaryMetrics, updateProfilePicture, getAdminSalesChartData, updateUserRole, toggleUserBan, deleteMyAccount } = require('../controllers/userController'); 
const { protect, admin } = require('../middleware/authMiddleware');
const { uploadProfilePicture } = require('../middleware/uploadMiddleware');

router.put('/profile', protect, updateProfile);

router.delete('/profile', protect, deleteMyAccount);

router.put(
  '/profile/picture', 
  protect, 
  uploadProfilePicture.single('profilePicture'),
  updateProfilePicture
);

// --- NEW: Toggle Follow Route ---
router.put('/follow/:shopId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const shopId = req.params.shopId;

    // Initialize following array if it doesn't exist
    if (!user.following) {
      user.following = [];
    }

    // Check if string ID exists in the array
    if (user.following.some(id => id.toString() === shopId)) {
      // Unfollow: Filter out the ID
      user.following = user.following.filter(id => id.toString() !== shopId);
      await user.save();
      return res.json({ isFollowing: false });
    } else {
      // Follow: Push the new ID
      user.following.push(shopId);
      await user.save();
      return res.json({ isFollowing: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error handling follow request" });
  }
});

// --- NEW: Get Followed Shops Details (For Profile Tab) ---
router.get('/following-details', protect, async (req, res) => {
  try {
    // Find user and populate the 'following' array with specific fields
    const user = await User.findById(req.user.id).populate('following', 'name shopName _id');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching following list" });
  }
});

// @desc    Get all users (Paginated & Searchable)
router.get('/', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: 'i' } },
            { email: { $regex: req.query.keyword, $options: 'i' } },
          ],
        }
      : {};

    const count = await User.countDocuments({ ...keyword });
    const users = await User.find({ ...keyword })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ message: "Server error fetching user list" });
  }
});

router.get('/admin/summary', protect, admin, getAdminSummaryMetrics);

router.get('/admin/sales-chart', protect, admin, getAdminSalesChartData);

// Admin Role Management
router.put('/:id/role', protect, admin, updateUserRole);

// Admin Ban Management
router.put('/:id/ban', protect, admin, toggleUserBan);

router.delete('/:id', protect, admin, deleteUser);

module.exports = router;