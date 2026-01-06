// backend/models/Asset.js
const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    // Expanded for modularity: Flavor, Frosting, and Size are now managed via the database
    enum: ['Layer', 'Topper', 'Decoration', 'Shape', 'Frosting', 'Flavor', 'Size', 'Texture', 'LayerHeight'], 
    required: true
  },
  modelUrl: { 
    type: String,
    default: null // Made optional for non-3D assets (Flavors, Sizes)
  },
  thumbnailUrl: { 
    type: String,
    default: null
  },
  priceModifier: { // Surcharge cost for this item (e.g., Ube flavor surcharge, topper cost)
    type: Number,
    default: 0
  },
  isAvailable: { 
    type: Boolean,
    default: true
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {}
  }
}, {
  timestamps: true
});

// ✅ NEW: Create a compound index to ensure the combination of name and type is unique.
assetSchema.index({ name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Asset', assetSchema);