const { Command } = require('../../lib/command');
const Warn = require('../../lib/models/schemas/warning');

Command({
    cmd_name: 'warn',
    category: 'admin',
    desc: 'Warn a user in the group'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin && !msg.fromMe) return;
    if (!msg.isBotAdmin) return;
    const x = msg.quoted?.sender || msg.mentions[0];
    if (!x) return msg.reply('_Tag or reply to a user_');
    const reason = msg.text || '_no reason_';
    const ctx = await Warn.find({ id: msg.user, userid: x });
    if (ctx.length >= 3) {
    await msg.kickUser(x);
    await Warn.deleteMany({ id: msg.user, userid: x });
    return msg.reply(`@${x.split('@')[0]} has been removed`, { mentions: [x] }); }
    await new Warn({id: msg.user,userid: x,reason: reason,warnedBy: msg.sender
    }).save();
    return msg.reply(`「 *warning* 」\n\n@${x.split('@')[0]}: ${ctx.length + 1}/3\n\n*Reason*: ${reason}`, { mentions: [x] });
});

Command({
    cmd_name: 'resetwarns',
    category: 'admin',
    desc: 'Reset warnings of a user'
})(async (msg) => {
    if (!msg.isGroup) return;
    if (!msg.isAdmin) return;
    if (!msg.isBotAdmin) return;
    const x = msg.quoted?.sender || msg.mentions[0];
    if (!x) return msg.reply('_Tag or reply to a user_');
    await Warn.deleteMany({ id: msg.user, userid: x });
    return msg.reply(`*Warning reset for:* @${x.split('@')[0]}`, { mentions: [x] });
});
