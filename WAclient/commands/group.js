
const { Command } = require('../../lib/command');

Command({
    cmd_name: 'close',
    aliases: ['mute'],
    category: 'admin',
    desc: 'Close/mute the group'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    await msg.groupClose(msg.user, false);
    return msg.reply('_Group closed_');
});

Command({
    cmd_name: 'open',
    aliases: ['unmute'],
    category: 'admin',
    desc: 'Open/unmute the group'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    await msg.groupOpen(msg.user, true);
    return msg.reply('_Group opened_');
});

Command({
    cmd_name: 'promote',
    category: 'admin',
    desc: 'Promote user to admin'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    const user = msg.quoted?.sender || msg.mentions[0];
    if (!user) return msg.reply('Tag or reply to someone to promote');
    await msg.addAdmin(user);
    return msg.reply(`@${user.split('@')[0]} promoted to admin`, { mentions: [user] });
});

Command({
    cmd_name: 'demote',
    category: 'admin',
    desc: 'Demote admin to member'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    const user = msg.quoted?.sender || msg.mentions[0];
    if (!user) return msg.reply('Tag or reply to someone to demote');
    await msg.removeAdmin(user);
    return msg.reply(`@${user.split('@')[0]} demoted to member`, { mentions: [user] });
});

Command({
    cmd_name: 'kick',
    category: 'admin',
    desc: 'Remove member from group'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    const user = msg.quoted?.sender || msg.mentions[0];
    if (!user) return msg.reply('Tag or reply to someone to kick');
    await msg.kickUser(user);
    return msg.reply(`@${user.split('@')[0]} kicked from group`, { mentions: [user] });
});

Command({
    cmd_name: 'add',
    category: 'admin',
    desc: 'Add member to group'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    const number = msg.text.replace(/[^0-9]/g, '');
    if (!number) return msg.reply('Provide a number to add');
    const user = number + '@s.whatsapp.net';
    try {
        await msg.addUser(user);
        return msg.reply(`@${number} added to group`, { mentions: [user] });
    } catch (error) {
        const link = await msg.getGroupLink(msg.user);
        return msg.reply(`Failed to add\nInvite link: ${link}`);
    }
});

Command({
    cmd_name: 'revoke',
    category: 'admin',
    desc: 'Revoke group invite link'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isAdmin && !msg.fromMe) return msg.reply('Only admins can use this command');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    await msg.revokeLink();
    return msg.reply('Group link revoked');
});

Command({
    cmd_name: 'link',
    aliases: ['invite'],
    category: 'group',
    desc: 'Get group invite link'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    const link = await msg.getGroupLink(msg.user);
    return msg.reply(link);
});

Command({
    cmd_name: 'ginfo',
    aliases: ['groupinfo'],
    category: 'group',
    desc: 'Get group information'
})(async (msg) => {
    if (!msg.isGroup) return msg.reply('This command can only be used in groups');
    const info = `*Group Info*\n\nName: ${msg.groupName}\nID: ${msg.user}\nMembers: ${msg.groupMembers.length}\nAdmins: ${msg.groupAdmins.length}\nDesc: ${msg.groupDesc}`;
    await msg.reply(info);
});
