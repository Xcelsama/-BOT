const { Command } = require('../../lib/command');
const { toSticker } = require('../../lib/Sticker');
const config = require('../../config');

Command({
    cmd_name: 'sticker',
    aliases: ['s', 'stick'],
    category: 'media',
    desc: 'Convert image/video to sticker'
})(async (msg, text) => {
        var text = msg.text;
        let media, type;
        if (msg.quoted) {
            const q = msg.quoted;
            if (q.image) {
                media = await q.download();
                type = 'image';
            } else if (q.video) {
                media = await q.download();
                type = 'video';
            } else if (q.gif) {
                media = await q.download();
                type = 'video';
            } else {
                return await msg.reply('_Reply to an media_');
            }
        } 
         else if (msg.image) {
            media = await msg.download();
            type = 'image';
        } else if (msg.video) {
            media = await msg.download();
            type = 'video';
        } else if (msg.gif) {
            media = await msg.download();
            type = 'video';
        } else {
            return await msg.reply('_Reply to an media_');
        }

        let packname = config.PACKNAME;
        let author = 'whatsapp-bot';
        if (text) {
            const parts = text.split('|');
            if (parts[0]) packname = parts[0].trim();
            if (parts[1]) author = parts[1].trim();
        }

        const stickerBuffer = await toSticker(type, media, {
            packname: packname,
            author: author
        });

        await msg.reply({ sticker: stickerBuffer });

});
