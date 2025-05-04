var { Command } = require('../../lib/command');
var { extractUrl } = require('../../lib/Functions');

Command({
  cmd_name: 'mentionall',
  category: 'admin',
  desc: 'Mention all members in the group'
})(async (msg) => {
  if (!msg.isGroup) return;
  if (!msg.isAdmin && !msg.fromMe) return;
  const participants = msg.groupMembers || [];
  const mentions = participants.map(p => p.id);
  const names = mentions.map(id => `▪️ @${id.split('@')[0]}`).join('\n');
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
    category: 'admin',
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
    category: 'admin',
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
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    await msg.tagAll(msg.text);
});

Command({
    cmd_name: 'delall',
    aliases: ['clearall'],
    category: 'admin',
    desc: 'Delete all bot messages'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    try {
        const messages = await msg.loadMessages(msg.user);
        let deleted = 0;
        for (const message of messages) {
            if (message.key.fromMe) {
                await msg.reply({ delete: message.key });
                deleted++;
            }
        }
        await msg.reply(`Successfully deleted ${deleted} messages`);
    } catch (error) {
        await msg.reply(error.message);
    }
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
    cmd_name: 'leave',
    alisas: ['left'],
    category: 'admin',
    desc: 'Make bot leave the group'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.fromMe) return;
    await msg.groupLeave(msg.user);
});

Command({
    cmd_name: 'join',
    category: 'owner',
    desc: 'Join a group via invite link'
})(async (msg) => {
    if (!msg.fromMe) return;
    var args = extractUrl(msg.text);
    if (!args && msg.quoted) {
    args = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || ''); }
    if (!args) return msg.reply('_Provide group link_');
    let code = args.split('whatsapp.com/')[1];
    if (!code) return msg.reply('_Invalid group link_');
    try { await msg.groupJoin(code);
    await msg.reply('_Group joined_');
    } catch (error) {
    await msg.reply('oops');
    }
});
