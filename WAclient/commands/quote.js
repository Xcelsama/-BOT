const {Command} = require('../../lib/');
const axios = require('axios');

Command({
    cmd_name: 'quote',
    aliases: ['q'],
    category: 'tools',
    desc: 'Create quote sticker from text'
})(async (msg) => {
        let text = '';
        let name = msg.pushName || 'xastral';
        let profileUrl = '';
        if (msg.quoted) {
            text = msg.quoted.message.conversation || 
                   msg.quoted.message.extendedTextMessage?.text || 
                   msg.quoted.message.imageMessage?.caption || 
                   msg.quoted.message.videoMessage?.caption || '';
            name = msg.quoted.pushName || 'xastral';
            try {
            profileUrl = await msg.Profile(msg.quoted.sender);
            } catch (e) {
            profileUrl = '';
            }
        } else {
            text = msg.text || '';
        }

        if (!text.trim()) return msg.reply('_Please provide text or reply to a message to create a quote_\n\nExample: `.quote diegoson❤️`');
        //await msg.reply('_C_');
        if (!profileUrl) {
            try {
            profileUrl = await msg.Profile(msg.sender);
            } catch (e) {
            profileUrl = '';
            }
        }
        const ctx = await axios.get('https://api.nekorinn.my.id/maker/quotechat', {
            params: {
                text: text.trim(),
                name: name,
                profile: profileUrl
            },
            responseType: 'arraybuffer'
        });

        if (ctx.status === 200) {
            await msg.send({
            sticker: Buffer.from(ctx.data)
            });
        } 
});
