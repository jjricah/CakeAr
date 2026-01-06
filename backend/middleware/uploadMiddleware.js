const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Factory function to create a reusable Multer/Cloudinary upload middleware.
 * @param {string} folderPrefix - The root folder on Cloudinary (e.g., 'creake/user-profiles')
 * @param {object} transformation - The Cloudinary transformation object
 * @returns {object} Multer instance
 */
const createUploadMiddleware = (folderPrefix, transformation = {}) => {
  // 1. Configure Cloudinary Storage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
      // The unique path depends on the user's ID
      const folder = `${folderPrefix}/user-${req.user._id}`;
      
      return {
        folder: folder,
        public_id: `${req.user._id}-${Date.now()}`, // Unique ID
        allowed_formats: ['jpeg', 'png', 'jpg'], // Restrict file types
        // Apply the passed-in transformation
        transformation: transformation
      };
    },
  });

  // 2. Configure Multer to use the storage engine
  const upload = multer({ 
      storage: storage,
      limits: {
          fileSize: 1024 * 1024 * 5 // 5 MB limit
      },
      fileFilter: (req, file, cb) => {
          if (file.mimetype.startsWith('image')) {
              cb(null, true);
          } else {
              // Reject non-image files with a custom error
              cb(new Error('Only image files (JPEG, PNG) are allowed.'), false);
          }
      }
  });
  
  // Return the Multer instance (which contains .single, .array, etc.)
  return upload;
};


// ----------------------------------------------------------------
// Export specific, configured instances for different use cases
// ----------------------------------------------------------------

// 1. For Shop Logos (300x300, crops to limit size)
const SHOP_LOGO_TRANSFORMATION = { width: 300, height: 300, crop: 'limit' };
const uploadShopLogo = createUploadMiddleware('creake/shop-logos', SHOP_LOGO_TRANSFORMATION);

// 2. For User Profile Pictures (150x150, crops to fill, for a circular profile image)
const PROFILE_PICTURE_TRANSFORMATION = { width: 150, height: 150, crop: 'fill', gravity: 'face' };
const uploadProfilePicture = createUploadMiddleware('creake/user-profiles', PROFILE_PICTURE_TRANSFORMATION);


// Note: Since this file was originally named 'uploadMiddleware.js' and exported 'upload', 
// we'll update the shopRoutes to use 'uploadShopLogo' for clarity.
// We must export what the original files expected, which was the shop logo middleware.
// For backwards compatibility, the original file exported `upload`. We'll keep the 
// general-purpose one named `upload` for simplicity, and export the profile one as well.

// The original file only exported one instance. For cleaner architecture:
module.exports = { 
    // This is what the original shopRoutes.js used: router.post('/register', protect, upload.single('shopLogo'), registerShop);
    // So we'll export the shop logo instance as the default export name
    upload: uploadShopLogo,
    // Export the profile picture middleware explicitly for other routes
    uploadProfilePicture, 
    // Exporting a function to make more instances if needed
    createUploadMiddleware
};