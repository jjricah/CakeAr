const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  baker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['Birthday', 'Wedding', 'Bento', 'Themed', 'Custom', 'Pastry'],
    default: 'Custom'
  },
  image: {
    type: String, 
    // In a real app, you'd upload to Cloudinary. 
    // For now, we use a placeholder or a direct URL string.
    default: 'https://placehold.co/400x400?text=Cake' 
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  inventory: {
    type: Number,
    required: true,
    default: 10 // Set a safe default stock level
  },
  // ✅ NEW: Add a structured object for product specifications
  specs: {
    size: { type: String, default: '6 x 4 inches' },
    servings: { type: String, default: '8-12 pax' },
    mainFlavor: { type: String, default: 'Classic Vanilla' },
    shelfLife: { type: String, default: '3 days refrigerated' },
    leadTime: { type: String, default: '3-5 business days' }
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);