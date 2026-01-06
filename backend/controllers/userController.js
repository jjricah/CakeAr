const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken'); // Ensure this file exists
const cloudinary = require('../utils/cloudinary');
const Baker = require('../models/Baker');
const Order = require('../models/Order');

// @desc    Update user profile (Name, Address, etc.)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { name, address, image } = req.body;

  const user = await User.findById(req.user.id).select('-password');

  if (user) {

    if (name !== undefined) {

      const trimmedName = name.trim();

      if (trimmedName === '') {
        return res.status(400).json({ message: 'Name cannot be empty.' });
      }
      user.name = trimmedName;
    }

    if (address !== undefined) {
      user.address = address;
    }

    // --- Handle Image Upload/Deletion ---
    if (image && image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: 'creake_user_avatars'
        });
        user.image = uploadRes.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        // Return specific error for image upload failure
        return res.status(500).json({ message: 'Image upload failed. Please try a smaller file.' });
      }
    } else if (image === null) {
      // Clear image if explicitly set to null
      user.image = null;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      address: updatedUser.address,
      following: updatedUser.following,
      image: updatedUser.image,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Admin deletes a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {


  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // 2. SELF-PROTECTION: Prevent admin from deleting themselves 
  if (user._id.toString() === req.user.id.toString()) {
    res.status(403);
    throw new Error('Cannot delete your own Admin account.');
  }

  await User.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: 'User removed' });
});

// @desc    Get Admin Summary Metrics
// @route   GET /api/users/admin/summary
// @access  Private (Admin)
const getAdminSummaryMetrics = async (req, res) => {

  try {
    // 1. User Counts (Group by role)
    const userStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // 2. Sales & Order Stats (Only count 'completed' orders)
    const salesStats = await Order.aggregate([
      { $match: { orderStatus: 'completed' } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
          completedOrders: { $sum: 1 }
        }
      }
    ]);

    // 3. Top Seller (Sort by totalEarnings)
    const topSeller = await Baker.find({})
      .sort({ totalEarnings: -1 })
      .limit(1)
      .populate('user', 'name');

    // Format the result
    const metrics = {
      userCounts: userStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      sales: salesStats[0] || { totalSales: 0, completedOrders: 0 },
      topSeller: topSeller[0] ? { name: topSeller[0].shopName, earnings: topSeller[0].totalEarnings } : null
    };

    res.json(metrics);

  } catch (error) {
    console.error("Admin Metrics Error:", error);
    res.status(500).json({ message: 'Server Error fetching metrics' });
  }
};

const updateProfilePicture = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
        if (req.file) {
            user.image = req.file.path; // The URL from Cloudinary via multer-storage-cloudinary
        } else {
            res.status(400);
            throw new Error("No image file provided.");
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            address: updatedUser.address,
            following: updatedUser.following,
            image: updatedUser.image,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get Admin Sales Chart Data
// @route   GET /api/users/admin/sales-chart
// @access  Private (Admin)
const getAdminSalesChartData = asyncHandler(async (req, res) => {
  try {
    // Aggregate sales data by day for the last 30 days
    const salesData = await Order.aggregate([
      {
        $match: {
          orderStatus: 'completed',
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
      { $project: { _id: 0, date: "$_id", sales: "$totalSales" } }
    ]);

    // Fill in missing dates with 0 sales for a continuous chart
    const dateMap = new Map(salesData.map(item => [item.date, item.sales]));
    const fullData = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      fullData.push({
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: dateMap.get(dateStr) || 0
      });
    }

    res.json(fullData);
  } catch (error) {
    console.error("Admin Sales Chart Error:", error);
    res.status(500).json({ message: 'Server Error fetching chart data' });
  }
});

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent modifying own role to avoid locking oneself out
  if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot change your own role.');
  }

  const { role } = req.body;
  if (!['buyer', 'seller', 'admin'].includes(role)) {
      res.status(400);
      throw new Error('Invalid role');
  }

  user.role = role;
  await user.save();

  res.json({ message: `User updated to ${role}`, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

// @desc    Ban/Unban user (Admin only)
// @route   PUT /api/users/:id/ban
// @access  Private (Admin)
const toggleUserBan = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot ban yourself.');
  }

  user.isBanned = !user.isBanned;
  await user.save();

  res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`, isBanned: user.isBanned });
});

// @desc    Delete own account
// @route   DELETE /api/users/profile
// @access  Private
const deleteMyAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

module.exports = {
  updateProfile,
  deleteUser,
  getAdminSummaryMetrics,
  updateProfilePicture,
  getAdminSalesChartData,
  updateUserRole,
  toggleUserBan,
  deleteMyAccount,
};