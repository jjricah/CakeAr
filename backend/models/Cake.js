const mongoose = require('mongoose');

const cakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'My Cake Design',
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    layers: [{
      type: String,
      enum: ['vanilla', 'chocolate', 'strawberry', 'redvelvet'],
    }],
    frosting: {
      type: String,
      enum: ['vanilla', 'chocolate', 'cream', 'strawberry'],
      default: 'vanilla',
    },
    toppings: [{
      type: String,
      enum: ['cherries', 'sprinkles', 'candles', 'flowers'],
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Cake', cakeSchema);
