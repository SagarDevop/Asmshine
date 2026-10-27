const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  icon: { type: String },
  desc: { type: String },
  image: { type: String }
}, {
  timestamps: true,
  strict: false
});

module.exports = mongoose.model('Category', categorySchema);
