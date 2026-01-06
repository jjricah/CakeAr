const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token. The role is required for admin checks.
      // We retrieve the user, and Mongoose excludes the password 
      // automatically since it's defined with 'select: false' in User.js.
      req.user = await User.findById(decoded.id).select('-password'); 

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

/**
 * @desc Admin middleware checks if the user has the 'admin' role.
 * It MUST be used AFTER the 'protect' middleware.
 */
const admin = (req, res, next) => {
    // Check if user is authenticated and has the 'admin' role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // Return 403 Forbidden if not admin
        res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
};

// 🔑 Export both middlewares
module.exports = { protect, admin };