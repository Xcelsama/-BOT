const mongoose = require('mongoose');

const AfkSchema = new mongoose.Schema({
    id: { type: String, required: true },
    reason: { type: String, default: 'Busy' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Afk', AfkSchema);
