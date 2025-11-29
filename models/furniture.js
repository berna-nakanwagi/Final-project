const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  quantity: {
    type: Number,
  },
  price: {
    type: Number,
  },
  date: {
    type: Date,
  },
  description: {
    type: String,
    // required:true,
  },
  type: {
    type: String, // 
    required: true
  },
  furnitureImage: {
    type: String,
  }
});

module.exports = mongoose.model('FurnitureStock', furnitureSchema);