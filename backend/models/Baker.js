// backend/models/Baker.js
const mongoose = require('mongoose');

const bakerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  shopName: {
    type: String,
    required: true,
    unique: true
  },
  shopLogo: { 
    type: String,
    default: '/images/default_shop_logo.png' 
  },
  shopDescription: {
    type: String,
    default: ''
  },
  specialties: [{
    type: String
  }],
  address: {
    street: { type: String, default: '' },
    barangay: { type: String, default: '' },
    city: { type: String, default: '' }
  },
  payoutInfo: {
    accountName: { type: String, default: '' },
    accountNumber: { type: String, default: '' },
    provider: { type: String, default: 'GCash' }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

module.exports = mongoose.model('Baker', bakerSchema);