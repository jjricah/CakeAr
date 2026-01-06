const Order = require('../models/Order');
const Product = require('../models/Product');
const DesignSubmission = require('../models/DesignSubmission');
const Notification = require('../models/Notification');
const Baker = require('../models/Baker');
const { calculateItemPrice, PRICING_RULES } = require('../config/priceCalculator');
const Asset = require('../models/Asset');
const asyncHandler = require('express-async-handler');

// @desc    Create a new order from cart items
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, dateNeeded, specialRequests, paymentReference, proofOfPaymentImage } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    let calculatedTotal = 0;
    const secureItems = [];
    const allAssets = await Asset.find({ isAvailable: true }); 

    // --- SECURITY & DATA INTEGRITY: Validate and secure each item ---
    for (const item of items) {
      let unitPrice = 0;
      let itemBakerId = null;

      // ✅ FIX: This controller should now ONLY handle standard products.
      // The 'custom' type is handled by createOrderFromDesign.
      if (item.type === 'standard' && item._id) {
        const product = await Product.findById(item._id);
        if (!product) throw new Error(`Product not found for item: ${item.title}`);
        if (product.inventory < item.quantity) { throw new Error(`Insufficient stock for ${product.title}. Only ${product.inventory} left.`); }
        
        unitPrice = product.basePrice;
        itemBakerId = product.baker;

        product.inventory -= item.quantity;
        await product.save();

        secureItems.push({
          product: product._id,
          title: product.title,
          price: unitPrice,
          quantity: item.quantity,
          baker: itemBakerId,
          type: 'standard',
          image: product.image
        });
      } 
      // ✅ FIX: Handle Custom Approved Designs added to Cart
      else if (item.type === 'custom_approved' && item._id) {
          const design = await DesignSubmission.findById(item._id);
          if (!design) throw new Error(`Design not found for item: ${item.title}`);
          
          if (design.status !== 'approved') throw new Error(`Design ${design._id} is not approved.`);

          secureItems.push({
              title: item.title,
              quantity: item.quantity,
              price: design.finalPrice,
              designSubmission: design._id,
              baker: design.baker,
              type: 'custom',
              image: design.snapshotImage
          });
      } else {
        // Fallback: Reject any invalid item types
        throw new Error(`Invalid item type specified: ${item.type}. This endpoint only accepts 'standard' products.`);
      }

      calculatedTotal += (unitPrice * item.quantity);
    }
    // --- END Item Validation ---

    calculatedTotal += PRICING_RULES.DELIVERY_FEE;

    let initialPaymentStatus = 'unpaid';
    if (paymentMethod === 'GCash' && proofOfPaymentImage) {
      initialPaymentStatus = 'pending_verification';
    }

    // 1. Create Order
    const order = await Order.create({
      buyer: req.user._id,
      items: secureItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentMethod,
      paymentReference,
      proofOfPaymentImage,
      dateNeeded,
      specialRequests,
      orderStatus: 'pending_review',
      paymentStatus: initialPaymentStatus
    });

    // 2. Update Design Submission Status - REMOVED, only happens in createOrderFromDesign

    res.status(201).json(order);
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Buyer's own orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get orders for the logged-in SELLER only
// @route   GET /api/orders/seller-orders
// @access  Private (Seller)
const getSellerOrders = async (req, res) => {
  try {
    const myProducts = await Product.find({ baker: req.user._id }).select('_id');
    const myProductIds = myProducts.map(p => p._id);

    const orders = await Order.find({
      $or: [
        { 'items.product': { $in: myProductIds } },
        { 'items.baker': req.user._id }
      ]
    })
      .populate('buyer', 'name email address')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Seller Order Fetch Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Seller)
const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus, deliveryDetails } = req.body;

    const updateFields = {};
    if (status) updateFields.orderStatus = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (deliveryDetails) updateFields.deliveryDetails = deliveryDetails;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: 'No valid status provided for update.' });
    }

    // --- AUTHORIZATION CHECK (CRITICAL FIX) ---
    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) return res.status(404).json({ message: 'Order not found' });

    // Check if user is Admin OR if the user is the Baker of the items
    const isOrderBaker = existingOrder.items.some(item =>
      item.baker && item.baker.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isOrderBaker) {
      return res.status(403).json({ message: 'Not authorized to update this order status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (status === 'completed' && existingOrder.orderStatus !== 'completed') {
      const isReadyForPayout = existingOrder.paymentMethod === 'COD' || existingOrder.paymentStatus === 'verified';

      if (isReadyForPayout) {
        // NOTE: This assumes a single baker per order for simplicity. 
        // For multi-baker orders, this needs to be split by item.
        const bakerId = existingOrder.items[0]?.baker;

        if (bakerId) {
          const updatedBaker = await Baker.findOneAndUpdate(
            { user: bakerId },
            { $inc: { totalEarnings: existingOrder.totalAmount } },
            { new: true }
          );

          if (updatedBaker) {
            console.log(`✅ Revenue Recognized for Baker: +₱${existingOrder.totalAmount}`);
          } else {
            console.warn(`Baker profile not found for ID: ${bakerId}. Revenue tracking skipped.`);
          }
        }
      }
    }

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Notify Buyer
    if (order.buyer && status) {
      const itemTitle = order.items && order.items[0] ? order.items[0].title : 'Custom Cake';

      try {
        await Notification.create({
          user: order.buyer,
          type: 'order_update',
          title: 'Order Status Updated',
          message: `Your order for "${itemTitle}" is now ${status.replace('_', ' ')}.`,
          relatedId: order._id
        });
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL orders (Admin View)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
const getAdminOrders = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const orders = await Order.find({})
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error("Admin All Orders Fetch Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Admin deletes an order (Hard Delete for cleanup)
// @route   DELETE /api/orders/admin/:id
// @access  Private (Admin)
const deleteOrderAdmin = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }

  try {
    const order = await Order.deleteOne({ _id: req.params.id });
    if (order.deletedCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order permanently deleted.' });
  } catch (error) {
    console.error("Admin Delete Order Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new order based on an accepted design submission
// @route   POST /api/orders/design-to-order
// @access  Private (Customer)
const createOrderFromDesign = async (req, res) => {
    try {
        const { 
            designId, 
            shippingAddress, 
            dateNeeded, 
            paymentMethod, 
            specialRequests, 
            totalAmount,
            // Payment proof fields are optional for COD
            proofOfPaymentImage, 
            paymentReference 
        } = req.body;

        if (!designId || !shippingAddress || !dateNeeded || !paymentMethod) {
            return res.status(400).json({ message: "Missing required order fields." });
        }

        // 1. Fetch and Validate Design Submission
        const design = await DesignSubmission.findById(designId).populate('baker', 'shopName');

        if (!design) {
            return res.status(404).json({ message: "Design Submission not found." });
        }

        if (design.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to order this design." });
        }

        if (design.status !== 'approved' || !design.finalPrice) {
            return res.status(400).json({ message: `Cannot place order. Design status must be 'approved' with a final price. Current status: ${design.status}.` });
        }

        if (!design.baker) {
            return res.status(400).json({ message: "Design has no assigned baker." });
        }

        // 2. Server-side price verification
        const serverCalculatedTotal = (design.finalPrice || 0) + (design.shippingFee || 0);
        const amountToPay = design.downpaymentAmount > 0 ? design.downpaymentAmount : serverCalculatedTotal;

        if (totalAmount < amountToPay) {
            return res.status(400).json({ message: `Payment amount is incorrect. Required: ₱${amountToPay.toFixed(2)}` });
        }

        // 2. Prepare Order Items (Itemized structure for a custom cake)
        const orderItems = [{
            title: `Custom Cake Design: ${design.config.shape} (${design.config.layers.length} tiers)`,
            quantity: 1,
            price: design.finalPrice, // Use the fixed, final quoted price
            // ✅ FIX: Use 'designSubmission' to match the Order model schema
            designSubmission: design._id, 
            baker: design.baker._id, // Link the item to the baker
            // Include snapshot image for order history clarity
            image: design.snapshotImage 
        }];

        // 3. Determine initial payment and order status
        let orderStatus = 'pending_review';
        let paymentStatus = 'unpaid'; // Default for COD, will be paid upon delivery

        if (paymentMethod === 'GCash') {
             // For GCash, require proof and set payment status to pending
            if (!proofOfPaymentImage) {
                return res.status(400).json({ message: "Proof of payment is required for GCash orders." });
            }
            paymentStatus = 'pending_verification';
        }
        
        // 4. Create the new Order document
        const order = new Order({
            buyer: req.user._id,
            items: orderItems,
            shippingAddress,
            dateNeeded,
            paymentMethod,
            totalAmount, // This is calculated on the client side, but used here
            specialRequests,
            // Custom fields for payment verification
            proofOfPaymentImage, 
            paymentReference,
            // Statuses
            orderStatus: orderStatus,
            paymentStatus: paymentStatus
        });

        await order.save();

        // 5. Update the Design Submission status to 'ordered' to lock it
        design.status = 'ordered';
        // Note: The isOrdered flag may be added to DesignSubmission model for clarity,
        // but changing the status is the minimum requirement.
        await design.save();

        // 6. Notify the Baker (Seller)
        // [Assuming Notification.create is available and working]
        // You would typically notify the baker that a new order has been placed.

        res.status(201).json(order);

    } catch (error) {
        console.error("Create Order From Design Error:", error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
  createOrder,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
  deleteOrderAdmin,
  getAdminOrders,
  createOrderFromDesign 
};