
const mongoose = require('mongoose');

const AiChatBot = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    enabled: { type: Boolean, default: false },
    model: { type: String, default: 'openai' },
    modelIndex: { type: Number, default: 0 }
});

module.exports = mongoose.model('AiChat', AiChatBot);
