const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    title: String,
    price: String,
    category: String,
    file: String,
 
});

module.exports = mongoose.model('carts',cartSchema);