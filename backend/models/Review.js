const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Who wrote the review
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Who received the review (the Baker/Seller)
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Which specific product was reviewed (optional)
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  // Which order this review belongs to (ensure only one review per order)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  image: {
    type: String, // URL of optional photo proof
    default: null
  },
}, { timestamps: true });

// Ensure a user can only review a specific order once
reviewSchema.index({ buyer: 1, order: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);