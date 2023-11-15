const mongoose = require("mongoose");

const otherf = new mongoose.Schema({
  username: String,
  email: String,
  message: String,
});

module.exports = mongoose.model("otherf", otherf);
