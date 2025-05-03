var {Command} = require('../../lib/command');

Command({
    cmd_name: 'vv',
    aliases: ['viewonce'],
    category: 'tools',
    desc: 'Reveal view once media'
})(async (msg) => {
    if (!msg.quoted) return msg.reply('Reply to a view once msg');
    const buffer = await msg.quoted.download();
    if (!buffer || !Buffer.isBuffer(buffer)) return;
    const type = msg.quoted.type;
    if (type === 'imageMessage') {
      await msg.send({ image: buffer, caption: 'Made with❤️' });
    } else if (type === 'videoMessage') {
      await msg.send({ video: buffer, caption: 'Made with❤️' });
    } 
});
