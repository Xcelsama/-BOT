const mongoose = require('mongoose');

const convo = new mongoose.Schema({
id: { type: String, required: true },
gid: { type: String, required: true },
messages: [{role: { type: String, enum: ['user', 'assistant'], required: true },
content: { type: String, required: true },
timestamp: { type: Date, default: Date.now }}],
lastUpdated: { type: Date, default: Date.now }});
convo.index({ id: 1, gid: 1 });
convo.methods.cleanupOldMessages = function() {
if (this.messages.length > 50) {
this.messages = this.messages.slice(-50);
    }
};

module.exports = mongoose.model('History', convo);
