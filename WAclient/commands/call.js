
const Call = require('../../lib/DB/schemas/CallSchema');
const { Command } = require('../../lib/command');

Command({
    cmd_name: 'call',
    category: 'admin',
    desc: 'Toggle global call auto-reject',
    usage: '.call on/off'
})(async (msg) => {
    if (!msg.fromMe && !msg.isSudo) return msg.reply('Only bot owner can use this command');
    
    const action = msg.text.toLowerCase();
    if (!['on', 'off'].includes(action)) return msg.reply('Use on or off');
    
    const settings = await Call.findOne({}) || await new Call({}).save();
    settings.globalAutoReject = action === 'on';
    await settings.save();
    
    return msg.reply(`Global call auto-reject has been ${action === 'on' ? 'enabled' : 'disabled'}`);
});
