var { Command } = require('../../lib/command');

Command({
  cmd_name: 'mentionall',
  category: 'admin',
  desc: 'Mention all members in the group'
})(async (msg) => {
  if (!msg.isGroup) return;
  const participants = msg.participants || [];
  const mentions = participants.map(p => p.id);
  const names = participants.map(p => `▪️ @${p.id.split('@')[0]}`).join('\n');
  await msg.send(`*Group Mention*\n\n${names}`, { mentions });
});

Command({
    cmd_name: 'close',
    aliases: ['mute'],
    category: 'admin',
    desc: 'Close/mute the group'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
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
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    await msg.groupOpen(msg.user, true);
    return msg.reply('_Group opened_');
});

Command({
    cmd_name: 'promote',
    category: 'admin',
    desc: 'Promote user to admin'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
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
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
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
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
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
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
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
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    await msg.revokeLink(msg.user);
    return msg.reply('*Group link revoked*');
});

Command({
    cmd_name: 'link',
    aliases: ['invite'],
    category: 'group',
    desc: 'Get group invite link'
})(async (msg) => {
    if (!msg.isGroup) return;
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
    if (!msg.isGroup) return;
    const info = `*Group Info*\n\nName: ${msg.groupName}\nID: ${msg.user}\nMembers: ${msg.groupMembers.length}\nAdmins: ${msg.groupAdmins.length}\nDesc: ${msg.groupDesc}`;
    await msg.reply(info);
});

Command({
    cmd_name: 'tag',
    aliases: ['tagall', 'all'],
    category: 'admin',
    desc: 'Tag all group members'
})(async (msg,args) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    await msg.tagAll(args.join(' '));
});

Command({
    cmd_name: 'del',
    aliases: ['delete'],
    category: 'admin',
    desc: 'Delete quoted message'
})(async (msg) => {
    if (!msg.fromMe) return;
    if (!msg.quoted) return msg.reply('Reply to a message to delete');
    if (!msg.quoted.fromMe) return msg.reply('I can only delete my own messages');
    await msg.reply({ delete: msg.quoted.key });
});

Command({
    cmd_name: 'delall',
    aliases: ['clearall'],
    category: 'admin',
    desc: 'Delete all bot messages'
})
 (async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    const messages = await msg.loadMessages(msg.user, 100);
    let deleted = 0;
    for (const message of messages) {
        if (message.key.fromMe) {
            await msg.reply({ delete: message.key });
            deleted++;
        }
    }
    
    await msg.reply(`Successfully deleted ${deleted} messages`);
});

Command({
    cmd_name: 'getjids',
    category: 'admin',
    desc: 'Get all group JIDs'
})
 (async (msg) => {
    const jids = await msg.getJids();
    let text = '*Group JIDs*\n\n';
    for (let jid of jids) {
        text += `${jid}\n`;
    }
    await msg.reply(text);
});

Command({
    cmd_name: 'grouppp',
    aliases: ['gpp'],
    category: 'admin',
    desc: 'Set full group profile picture'
})
 (async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    if (!msg.isBotAdmin) return msg.reply('Bot needs to be admin');
    let image;
    if (msg.quoted && msg.quoted.type.includes('image')) {
        const buffer = await msg.quoted.download();
        image = buffer;
    } else if (msg.type.includes('image')) {
        const buffer = await msg.download();
        image = buffer;
    } else {
        return msg.reply('Please reply to an image');
    }
    var success = await msg.toFullpp(image, true);
    if (success) {
        await msg.reply('_Group profile picture updated_');
    } else {
        await msg.reply('err');
    }
});

