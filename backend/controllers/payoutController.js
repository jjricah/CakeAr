const asyncHandler = require('express-async-handler');
const Payout = require('../models/Payout');
const Baker = require('../models/Baker');

// @desc    Request a payout
// @route   POST /api/payouts
// @access  Private (Seller)
const requestPayout = asyncHandler(async (req, res) => {
  const baker = await Baker.findOne({ user: req.user._id });

  if (!baker) {
    res.status(404);
    throw new Error('Baker profile not found');
  }

  if (baker.totalEarnings <= 0) {
    res.status(400);
    throw new Error('Insufficient funds for payout');
  }

  const amount = baker.totalEarnings;

  // Create Payout Record
  const payout = await Payout.create({
    baker: baker._id,
    amount: amount,
    payoutMethod: baker.payoutInfo
  });

  // Reset Earnings (Simulating transfer to pending payout)
  baker.totalEarnings = 0;
  await baker.save();

  res.status(201).json({
    message: 'Payout request submitted successfully.',
    payout,
    newBalance: 0
  });
});

// @desc    Get payout history
// @route   GET /api/payouts
// @access  Private (Seller)
const getPayouts = asyncHandler(async (req, res) => {
  const baker = await Baker.findOne({ user: req.user._id });
  if (!baker) {
      return res.json([]);
  }
  const payouts = await Payout.find({ baker: baker._id }).sort({ createdAt: -1 });
  res.json(payouts);
});

module.exports = { requestPayout, getPayouts };