
const { Command } = require('../../lib/command');
const Group = require('../../lib/DB/schemas/GroupSchema');

Command({
    cmd_name: 'goodbye',
    aliases: ['setgoodbye'],
    category: 'group',
    desc: 'Toggle goodbye message or set custom goodbye message',
    usage: '.goodbye [on/off] or .goodbye <custom message>'
})(async (msg, args) => {
    if (!msg.isGroup) return msg.reply('*This command only works in groups!*');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('*Admin only command!*');

    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    
    if (!args.length) {
        group.goodbye = !group.goodbye;
        await group.save();
        return msg.reply(`*Goodbye message ${group.goodbye ? 'enabled' : 'disabled'}*`);
    }

    if (args[0].toLowerCase() === 'on') {
        group.goodbye = true;
        await group.save();
        return msg.reply('*Goodbye message enabled*');
    }

    if (args[0].toLowerCase() === 'off') {
        group.goodbye = false;
        await group.save();
        return msg.reply('*Goodbye message disabled*');
    }

    group.goodbyeMsg = args.join(' ');
    await group.save();
    return msg.reply(`*Goodbye message updated*\n\nPreview:\n${group.goodbyeMsg}`);
});
