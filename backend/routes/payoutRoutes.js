const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requestPayout, getPayouts } = require('../controllers/payoutController');

router.post('/', protect, requestPayout);
router.get('/', protect, getPayouts);

module.exports = router;