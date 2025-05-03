const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  on: { type: Boolean, default: false }
});

module.exports = mongoose.model('Reaction', schema);
