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

Command({
on: 'message'
})(async (msg) => {
  const af = await Afk.findOne({ userId: msg.sender });
  if (af && (msg.fromMe || msg.sender.split('@')[0] === config.OWNER_NUM)) {
  const duration = Math.floor((Date.now() - af.timestamp) / 1000);
  await msg.reply(`*Welcome back*\nYou were AFK for ${duration} seconds`);
  await Afk.deleteOne({ id: msg.sender });
  } if (msg.mentions && msg.mentions.length > 0) {
            for (const mention of msg.mentions) {
                const ctx = await Afk.findOne({ id: mention });
                if (ctx) {
                    const duration = Math.floor((Date.now() - ctx.timestamp) / 1000);
                    await msg.reply(`@${mention.split('@')[0]} is currently AFK\n\nReason: ${ctx.reason}\nDuration: ${duration} seconds`, {
                        mentions: [mention]
                    });
                }
            }
        }
});
          
