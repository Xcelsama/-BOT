
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    welcome: { type: Boolean, default: false },
    goodbye: { type: Boolean, default: false },
    welcomeMsg: { type: String, default: 'Welcome @user\nTo @group\n\nMember count: @count' },
    goodbyeMsg: { type: String, default: 'Goodbye @user\nFrom @group\n\nMember count: @count' }
});

module.exports = mongoose.model('Group', GroupSchema);
