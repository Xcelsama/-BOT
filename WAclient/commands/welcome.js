
const { Command } = require('../../lib/command');
const Group = require('../../lib/DB/schemas/GroupSchema');

Command({
    cmd_name: 'welcome',
    aliases: ['setwelcome'],
    category: 'group',
    desc: 'Toggle welcome message or set custom welcome message',
    usage: '.welcome [on/off] or .welcome <custom message>'
})(async (msg, args) => {
    if (!msg.isGroup) return msg.reply('*This command only works in groups!*');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('*Admin only command!*');

    let group = await Group.findOne({ id: msg.user }) || await new Group({ id: msg.user }).save();
    
    if (!args.length) {
        group.welcome = !group.welcome;
        await group.save();
        return msg.reply(`*Welcome message ${group.welcome ? 'enabled' : 'disabled'}*`);
    }

    if (args[0].toLowerCase() === 'on') {
        group.welcome = true;
        await group.save();
        return msg.reply('*Welcome message enabled*');
    }

    if (args[0].toLowerCase() === 'off') {
        group.welcome = false;
        await group.save();
        return msg.reply('*Welcome message disabled*');
    }

    group.welcomeMsg = args.join(' ');
    await group.save();
    return msg.reply(`*Welcome message updated*\n\nPreview:\n${group.welcomeMsg}`);
});
