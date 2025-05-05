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
    var args = msg.text.toLowerCase();
    if (!['on', 'off'].includes(args)) return msg.reply('Use on or off');
    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    if (!args.length) {
        group.welcome = true;
        group.welcome = !group.welcome;
        await group.save();
        return msg.reply(`*Welcome msg ${group.welcome ? 'enabled' : 'disabled'}*`);
    }   return msg.reply('*Welcome message enabled*');
    }  if (args) {
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
