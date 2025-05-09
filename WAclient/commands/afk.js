const { Command } = require('../../lib/command');
const config = require('../../config');
const Afk = require('../../lib/models/schemas/afk');

Command({
    cmd_name: 'afk',
    category: 'group',
    desc: 'Set your AFK status',
    usage: '.afk [reason]'
})(async (msg) => {
    if (!msg.fromMe) return;
    const reason = msg.text || 'Busy';
    await Afk.findOneAndUpdate(
  { id: msg.sender },{ id: msg.sender, reason, timestamp: Date.now() },
        { upsert: true, new: true }
        );
        await msg.reply(`*AFK Mode*\n\nReason: ${reason}`);
});

Command({
    on: 'message',
    category: 'system'
})(async (msg) => {        
const af = await Afk.findOne({ id: msg.sender });
        if (af && (msg.fromMe)) {
            const duration = Math.floor((Date.now() - af.timestamp) / 1000);
            await msg.reply(`*Welcome back*\nYou were AFK for ${duration} seconds`);
            await Afk.deleteOne({ id: msg.sender });
        }   if (msg.mentions && msg.mentions.length > 0) {
            for (const mention of msg.mentions) {
                const men = await Afk.findOne({ id: mention });
                if (men) {
                    const duration = Math.floor((Date.now() - men.timestamp) / 1000);
                    await msg.reply(`*@${mention.split('@')[0]} is currently AFK*\n\n*Reason:* ${men.reason}\n*Duration:* ${duration} _seconds_`, {
                        mentions: [mention]
                    });
                }
            }
        }
});

Command({
    cmd_name: 'resetafk',
    category: 'owner',
    desc: 'Reset AFK status (Owner only)'
})(async (msg) => {
    if (!msg.fromMe) return;
     if (msg.quoted) {
      const user = msg.quoted.sender;
      await Afk.deleteOne({ id: user });
      await msg.reply(`*Reseted: @${user.split('@')[0]}*`, {
        mentions: [user]
    });
        } else {
            await Afk.deleteOne({ id: msg.sender });
            await msg.reply('*Reset AFK status*');
        }
});
