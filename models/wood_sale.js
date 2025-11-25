const mongoose = require('mongoose');

const woodSalesSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    paymentType: {
        type: String,
        required: true,
    },
    salesAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
        required: true,
    },
    transport: {
        type: Boolean,
        default: false,
    },
    measurements: {
        type: String,
        required: true,
    },
     color: {
        type: String,
        required: true,
    },
     quality: {
        type: String,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model('wood_sale', woodSalesSchema);
