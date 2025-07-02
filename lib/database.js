const mongoose = require('mongoose');
const callRejectSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: false },
    message: { type: String, default: '📞 Auto Call Reject is enabled' }
});

const aliveDB = new mongoose.Schema({
    message: { type: String, default: 'ᴀʟɪᴠᴇ' },
    enabled: { type: Boolean, default: true }
});

const CallReject = mongoose.model('CallReject', callRejectSchema);
const Alive = mongoose.model('Alive', aliveDB);
module.exports = { CallReject, Alive };
