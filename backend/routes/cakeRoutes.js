const express = require('express');
const router = express.Router();
const {
  createCake,
  getCakes,
  getCakeById,
  updateCake,
  deleteCake,
} = require('../controllers/cakeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createCake).get(protect, getCakes);
router
  .route('/:id')
  .get(protect, getCakeById)
  .put(protect, updateCake)
  .delete(protect, deleteCake);

module.exports = router;
