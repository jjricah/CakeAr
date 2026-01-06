const Product = require('../models/Product');
const cloudinary = require('../utils/cloudinary');
const Review = require('../models/Review');
const Baker = require('../models/Baker');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller)
const createProduct = async (req, res) => {
  try {
    const { title, description, basePrice, category, image } = req.body;

    let imageUrl = 'https://placehold.co/400x400?text=Cake';

    // ✅ UPLOAD LOGIC: Upload to Cloudinary if image data exists
    if (image && image.startsWith('data:image')) {
      try {
        const uploadRes = await cloudinary.uploader.upload(image, {
          folder: 'creake_products'
        });
        imageUrl = uploadRes.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        // Fallback or throw error depending on strictness
      }
    } else if (image) {
      // If it's just a string URL (not base64), assume user pasted a link
      imageUrl = image;
    }

    const product = await Product.create({
      baker: req.user._id,
      title,
      description,
      basePrice,
      category,
      image: imageUrl
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all products for the logged-in seller
// @route   GET /api/products/seller
// @access  Private (Seller)
const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ baker: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all products (Public Marketplace)
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res) => {
    try {
        // 1. Get all products, but only populate the baker's user ID. Use .lean() for performance.
        const products = await Product.find({ isAvailable: true })
            .populate({ path: 'baker', select: '_id name' }) // Populate user ID and name
            .sort({ createdAt: -1 })
            .lean();

        // 2. Get unique baker user IDs from the products
        const bakerUserIds = [...new Set(products.map(p => p.baker?._id).filter(id => id))];

        // 3. Fetch all corresponding Baker profiles in one query
        const bakers = await Baker.find({ user: { $in: bakerUserIds } })
            .select('user shopName rating numReviews shopLogo')
            .lean();

        // 4. Create a map for easy lookup
        const bakerMap = bakers.reduce((acc, baker) => {
            acc[baker.user.toString()] = baker;
            return acc;
        }, {});

        // 5. Combine product data with baker profile data
        const populatedProducts = products.map(product => {
            if (!product.baker) { // Handle products with no baker
                return {
                    ...product,
                    baker: { shopName: 'Unknown Baker', rating: 0, numReviews: 0 }
                };
            }
            const bakerProfile = bakerMap[product.baker._id.toString()];
            return {
                ...product,
                baker: { // Overwrite the original baker object with rich data
                    _id: product.baker._id,
                    shopName: bakerProfile?.shopName || product.baker?.name || 'Unknown Baker',
                    rating: bakerProfile?.rating || 0,
                    numReviews: bakerProfile?.numReviews || 0,
                    shopLogo: bakerProfile?.shopLogo
                }
            };
        });

        res.status(200).json(populatedProducts);
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get all products (Admin View)
// @route   GET /api/products/admin/all
// @access  Private/Admin
const getAllProductsAdmin = async (req, res) => {
  // Security check is now primarily done in authMiddleware's 'admin' function

  try {
    // Fetch ALL products, including those not marked 'isAvailable'
    const products = await Product.find({})
      .populate('baker', 'shopName address user')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching all products (Admin):", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    // 1. Fetch Product and ONLY the necessary base User details for the Baker
    // We only need the User ID (`_id`), and maybe the User's name as a fallback.
    const product = await Product.findById(req.params.id)
      .populate('baker', 'name email role'); // Populate safe fields from User model
      
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // The User ID of the Baker is product.baker._id
    const bakerUserId = product.baker._id;

    // 2. Get Seller's Aggregate Stats (the Baker document)
    // This is where shopName, rating, etc. are located.
    const sellerStats = await Baker.findOne({ user: bakerUserId });

    // 3. Get Reviews for this product (Using the correct bakerUserId)
    const reviews = await Review.find({ 
        $or: [
            { product: req.params.id }, 
            { seller: bakerUserId } 
        ]
    })
    .populate('buyer', 'name')
    .sort({ createdAt: -1 })
    .limit(5); 

    // 4. Combine data into a single, clean response object
    const responseData = {
        ...product.toObject(),
        baker: {
            // **Spread the basic User info (includes _id)**
            ...product.baker.toObject(), 
            
            // 🔑 FIX: Explicitly overwrite/add shop-specific properties
            // Primary value is shopName from the Baker doc, fallback is User's name, final fallback is 'Unknown Seller'
            shopName: sellerStats?.shopName || (product.baker.name ? String(product.baker.name) : null) || 'Unknown Seller',
            
            // Inject all other shop-specific fields from the Baker document
            rating: sellerStats?.rating || 5.0,
            numReviews: sellerStats?.numReviews || 0,
            shopLogo: sellerStats?.shopLogo || null // Added for frontend completeness
            // You can add shopDescription and address fields here too, if needed
        },
        reviews
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching product details:", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update a product by ID
// @route   PUT /api/products/:id
// @access  Private (Seller)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // The user's original ownership check logic:
    if (product.baker.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product (Seller)
// @route   DELETE /api/products/:id
// @access  Private (Seller)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // The user's original ownership check logic:
    if (product.baker.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================================================
// 🛠️ NEW ADMIN FUNCTION
// ===================================================

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/admin/:id
// @access  Private/Admin
const deleteProductAdmin = async (req, res) => {
  // Security check is now primarily done in authMiddleware's 'admin' function

  try {
    // Look up the product
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Admin bypasses the baker/owner check and deletes directly.
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Product removed by Admin' });
  } catch (error) {
    console.error("Error deleting product (Admin):", error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};


module.exports = {
  createProduct,
  getSellerProducts,
  getAllProducts,
  getAllProductsAdmin,
  getProductById,
  updateProduct,
  deleteProduct,
  // 🔑 Export the new Admin Delete function
  deleteProductAdmin
};