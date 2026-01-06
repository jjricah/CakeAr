const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Baker = require('../models/Baker');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // --- SMART ADMIN LOGIC ---
    // Check if this is the FIRST user in the database
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'buyer';
    // -------------------------

    const user = await User.create({
      name,
      email,
      password,
      role, // Assign role dynamically
      isVerified: isFirstAccount // Auto-verify the first admin for instant access
    });

    if (user) {
      // If this is the First User (Admin), skip email verification flow
      if (isFirstAccount) {
        return res.status(201).json({ 
          success: true, 
          message: 'System initialized! Admin account created and verified automatically. You can now log in.' 
        });
      }

      // Generate verification token
      const verificationToken = user.getVerificationToken();
      await user.save({ validateBeforeSave: false });

      // Create verification URL
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

      const message = `Please verify your email address to complete your registration by clicking the link below:\n\n${verifyUrl}`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Creake Email Verification',
          message,
        });

        res.status(201).json({ success: true, message: `Registration successful! Please check your email (${user.email}) to verify your account.` });
      } catch (err) {
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({ message: 'Email could not be sent. Registration failed.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // CRITICAL: Force retrieval of the password hash using select('+password')
    const user = await User.findOne({ email }).select('+password'); 

    if (!user) {
        // User not found in DB
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // --- CRITICAL DIAGNOSTIC LOG START ---
    console.log("--- LOGIN DIAGNOSTIC START ---");
    console.log(`User email found: ${user.email}`);
    // Check if user.password holds a string (the hash)
    console.log(`Password hash retrieved? ${!!user.password ? 'YES (Length: ' + user.password.length + ')' : 'NO (Undefined)'}`);
    console.log("--- LOGIN DIAGNOSTIC END ---");
    // --- CRITICAL DIAGNOSTIC LOG END ---
    
    // Check password using the Mongoose compare method
    if (user && (await user.comparePassword(password))) {

     // Check if email is verified
     if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email address before logging in.' });
     }

     // Check if user is banned
     if (user.isBanned) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
     }
     
     let shopName = null;
      // 1. If user is a seller, fetch their shop name from the Baker document
      if (user.role === 'seller') {
          const bakerProfile = await Baker.findOne({ user: user._id }).select('shopName');
          shopName = bakerProfile ? bakerProfile.shopName : null;
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, 
        address: user.address,
        shopName: shopName,
        token: generateToken(user._id),
      });
    } else {
      // If retrieval failed (user.password is undefined), the comparison will always return false here.
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      // To prevent email enumeration, we send a generic success message even if the user doesn't exist.
      return res.status(200).json({ success: true, data: 'Email sent' });
    }

    // Get reset token from the user model method
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL for the frontend page
    // IMPORTANT: Adjust the base URL to your frontend's actual URL in production
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please click the link below, or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Creake Password Reset Request',
        message,
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      console.error('Email sending error:', err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token from the URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email
// @route   PUT /api/auth/verify-email/:token
// @access  Public
const verifyEmail = async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({ verificationToken });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export functions (Using 'register' and 'login' names to keep routes working)
module.exports = { register, login, getMe, forgotPassword, resetPassword, verifyEmail };