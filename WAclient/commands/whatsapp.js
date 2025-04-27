const {Command} = require('../../lib/command');

Command({
    cmd_name: 'block',
    category: 'owner',
    desc: 'Block a user'
})(async (msg) => {
    if (!msg.fromMe) return;
    const user = msg.quoted?.sender || msg.mentions[0] || msg.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!user) return msg.reply('Tag someone or reply to them');
    await msg.BlockStatus(user, "block");
    return msg.reply(`@${user.split('@')[0]} has been blocked`, { mentions: [user] });
});

Command({
    cmd_name: 'unblock',
    category: 'owner',
    desc: 'Unblock a user'
})(async (msg) => {
    if (!msg.fromMe) return;
    const user = msg.quoted?.sender || msg.mentions[0] || msg.text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
    if (!user) return msg.reply('Tag someone or reply to them');
    await msg.BlockStatus(user, "unblock");
    return msg.reply(`@${user.split('@')[0]} has been unblocked`, { mentions: [user] });
});
