const Call = require('../../lib/models/schemas/CallSchema');
const { Command } = require('../../lib/command');

Command({
    cmd_name: 'call',
    category: 'owner',
    desc: 'Toggle global call auto-reject',
    usage: '.call on/off'
})(async (msg) => {
    if (!msg.fromMe) return;
    const action = msg.text.toLowerCase();
    if (!['on', 'off'].includes(action)) return msg.reply('Use on or off');
    const settings = await Call.findOne({}) || await new Call({}).save();
    settings.globalAutoReject = action === 'on';
    await settings.save();
    return msg.reply(`auto-call has been ${action === 'on' ? 'enabled' : 'disabled'}`);
});
