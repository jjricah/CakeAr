// backend/models/DesignSubmission.js
const mongoose = require('mongoose');

// This enforces structure and types for each layer in the array.
const layerSchema = new mongoose.Schema({
  // width/diameter of the cake layer (e.g., in inches or cm)
  width: {
    type: Number,
    required: true,
    default: 6 // Default width, used in price calculation
  },
  // flavor name, used for price calculation lookup
  flavor: {
    type: String,
    required: true,
    default: 'Vanilla'
  },
  height: { 
    type: Number, 
    required: true, 
    default: 4 
  }
}, { _id: false }); // We typically don't need a unique _id for each embedded sub-document

// --- Step 2: Update the main Design Submission schema ---
const designSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  baker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  config: {
    shape: { type: String, required: true },
    layers: [layerSchema],
    frosting: String,
    frostingCoverage: String,
    toppings: Object, // Keeping as Object for flexible key/value toppings config for now
    messageConfig: {
      text: { type: String, default: '' },
      color: { type: String, default: '#4A403A' },
      position: { type: String, default: 'top' },
      font: { type: String, default: 'sans-serif' }
    }
  },
  // Added fields for request details
  targetDate: { type: Date },
  requestType: { type: String, enum: ['direct', 'broadcast'], default: 'direct' },

  estimatedPrice: { type: Number, required: true },
  finalPrice: { type: Number },
  downpaymentAmount: { type: Number, default: 0 },
  snapshotImage: { type: String },

  status: {
    type: String,
    // Comprehensive status enum supporting the design review workflow
    enum: ['pending', 'discussion', 'quoted', 'reviewed', 'approved', 'declined', 'ordered'],
    default: 'pending'
  },
  bakerNote: { type: String },
  userNote: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DesignSubmission', designSubmissionSchema);