const Cake = require('../models/Cake');

// @desc    Create a new cake design
// @route   POST /api/cakes
// @access  Private
exports.createCake = async (req, res) => {
  try {
    const { name, size, layers, frosting, toppings } = req.body;

    const cake = await Cake.create({
      user: req.user.id,
      name: name || 'My Cake Design',
      size,
      layers,
      frosting,
      toppings,
    });

    res.status(201).json(cake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all cakes for logged-in user
// @route   GET /api/cakes
// @access  Private
exports.getCakes = async (req, res) => {
  try {
    const cakes = await Cake.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(cakes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single cake by ID
// @route   GET /api/cakes/:id
// @access  Private
exports.getCakeById = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    // Check if cake belongs to user
    if (cake.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(cake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cake design
// @route   PUT /api/cakes/:id
// @access  Private
exports.updateCake = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    // Check if cake belongs to user
    if (cake.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedCake = await Cake.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedCake);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete cake design
// @route   DELETE /api/cakes/:id
// @access  Private
exports.deleteCake = async (req, res) => {
  try {
    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({ message: 'Cake not found' });
    }

    // Check if cake belongs to user
    if (cake.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await cake.deleteOne();
    res.status(200).json({ message: 'Cake deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
