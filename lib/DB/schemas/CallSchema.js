
const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
    globalAutoReject: { type: Boolean, default: false }
});

module.exports = mongoose.model('Call', CallSchema);
