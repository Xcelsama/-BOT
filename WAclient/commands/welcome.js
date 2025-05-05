const {Command} = require('../../lib/command');
const Group = require('../../lib/models/schemas/GroupSchema');

Command({
    cmd_name: 'welcome',
    category: 'admin',
    desc: 'Toggle welcome message on/off',
    usage: '.welcome [on/off]'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    var args = msg.text;
    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    if (!args.length) {
        group.welcome = !group.welcome;
        await group.save();
        return msg.reply(`*Welcome msg ${group.welcome ? 'enabled' : 'disabled'}*`);
    }
    
    const cmd = args.toLowerCase().trim();
    if (cmd === 'on') {
        group.welcome = true;
        await group.save();
        return msg.reply('*Welcome message enabled*');
    }
    
    if (cmd === 'off') {
        group.welcome = false;
        await group.save();
        return msg.reply('*Welcome message disabled*');
    }
});

Command({
    cmd_name: 'setwelcome',
    category: 'admin',
    desc: 'Set custom welcome message',
    usage: '.setwelcome <custom message>'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    var args = msg.text;
    if (!args.length) return msg.reply('*Please provide a welcome message*');
    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    group.welcomemsg = args;
    await group.save();
    return msg.reply(`*Welcome message updated*\n\nPreview:\n${group.welcomemsg}`);
});
