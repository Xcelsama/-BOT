const {Command} = require('../../lib/command');

Command({
    cmd_name: 'fullpp',
    aliases: ['setp'],
    category: 'owner',
    desc: 'Set full size profile picture'
})(async (msg) => {
    if (!msg.fromMe) return;
    const quoted = msg.quoted ? msg.quoted : msg;
    const mime = quoted.type || '';
    if (!/image/.test(mime)) return msg.reply('_Reply to an image_'); 
    const buffer = await quoted.download();
    await msg.updateProfilePicture(buffer);
    await msg.reply('*_Profile  updated_*');
});
