const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  baker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Baker',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'rejected'],
    default: 'pending'
  },
  payoutMethod: {
    provider: String,
    accountName: String,
    accountNumber: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);