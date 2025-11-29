const mongoose = require('mongoose');

const FurnitureSalesSchema = new mongoose.Schema({
    customerName: {
        type: String,
    },
    productType: {
        type: String,
        // trim: true,
        // unique: true,
    },
    productName: {
        type: String,
    },
    quantity: {
        type: String,
        // required:true,
    },
    unitPrice: {
        type: String
    },
    date: {
        type: String
    },
     paymentType: {
        type: String
    },
     salesAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Registration"
    },
     tranport: {
        type: String
    },
});
module.exports = mongoose.model('FurnitureSales', FurnitureSalesSchema);