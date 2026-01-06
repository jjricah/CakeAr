const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    type: { type: String, enum: ['standard', 'custom'], default: 'standard' },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    designSubmission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DesignSubmission',
    },
    baker: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const orderSchema = new mongoose.Schema({
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        barangay: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'GCash']
    },
    paymentReference: {
        type: String
    },
    proofOfPaymentImage: {
        type: String
    },
    dateNeeded: {
        type: Date,
        required: true
    },
    specialRequests: {
        type: String
    },
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending_review', 'accepted', 'baking', 'ready_to_ship', 'completed', 'cancelled'],
        default: 'pending_review'
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ['unpaid', 'pending_verification', 'verified', 'failed', 'paid'],
        default: 'unpaid'
    },
    deliveryDetails: {
        trackingNumber: { type: String },
        courier: { type: String },
        estimatedDelivery: { type: Date }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
