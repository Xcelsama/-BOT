const { Command } = require('../../lib/command');

Command({
    cmd_name: 'vv',
    aliases: ['antivo', 'antiviewonce'],
    category: 'tools',
    desc: 'Convert view once media to normal media'
})
  (async (msg) => {
    if (!msg.quoted) return msg.reply('*Reply to a view once message*');
    if (!msg.quoted.message?.viewOnceMessageV2?.message) return;
    const stream = await msg.quoted.download();
    if (!stream) return;
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    const type = msg.quoted.type === 'viewOnceMessageV2' 
    ? Object.keys(msg.quoted.message.viewOnceMessageV2.message)[0]
   : msg.quoted.type;
    const ctx = msg.quoted.message.viewOnceMessageV2.message[type]?.caption || '';
    const cap = `*HERE IS YOUR*\n\n${ctx}`;
    if (type.includes('image')) {
        await msg.send({ image: buffer, caption: cap });
    } else if (type.includes('video')) {
        await msg.send({ video: buffer, caption: cap });
    }
});
