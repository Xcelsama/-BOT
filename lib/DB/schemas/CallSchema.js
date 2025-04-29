
const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    globalAutoReject: { type: Boolean, default: true }
});

module.exports = mongoose.model('Call', CallSchema);
