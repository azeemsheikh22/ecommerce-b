const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: String,
    price: String,
    category: String,
    file: String,
 
});

module.exports = mongoose.model('products',productSchema);