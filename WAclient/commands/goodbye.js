
const {Command} = require('../../lib/command');
const Group = require('../../lib/DB/schemas/GroupSchema');

Command({
    cmd_name: 'goodbye',
    category: 'admin',
    desc: 'Toggle goodbye message on/off',
    usage: '.goodbye [on/off]'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('*Admin only command*');
    var args = msg.text;
    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    
    if (!args.length) {
        group.goodbye = !group.goodbye;
        await group.save();
        return msg.reply(`*Goodbye message ${group.goodbye ? 'enabled' : 'disabled'}*`);
    }
    
    const cmd = args.toLowerCase().trim();
    if (cmd === 'on') {
        group.goodbye = true;
        await group.save();
        return msg.reply('*Goodbye message enabled*');
    }
    
    if (cmd === 'off') {
        group.goodbye = false;
        await group.save();
        return msg.reply('*Goodbye message disabled*');
    }
});

Command({
    cmd_name: 'setgoodbye',
    category: 'admin',
    desc: 'Set custom goodbye message',
    usage: '.setgoodbye <custom message>'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('*Admin only command*');
    var args = msg.text;
    if (!args.length) return msg.reply('*Please provide a goodbye message*');
    
    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    group.goodbyemsg = args;
    await group.save();
    return msg.reply(`*Goodbye message updated*\n\nPreview:\n${group.goodbyemsg}`);
});
