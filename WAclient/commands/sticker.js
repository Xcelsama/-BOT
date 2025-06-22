const { Command } = require('../../lib/command');
const { toSticker } = require('../../lib/Sticker');
const config = require('../../config');

Command({
    cmd_name: 'sticker',
    aliases: ['s', 'stick'],
    category: 'media',
    desc: 'Convert image/video to sticker'
})(async (msg, text) => {
        let media, type;
        const mediaTypes = ['image', 'video', 'gif'];
        const source = msg.image || msg.video || msg.gif ? msg : msg.quoted;
        if (!source) 
        return await msg.reply('_Reply to an media_');
        for (const mediaType of mediaTypes) {
            if (source[mediaType]) {
                media = await source.download();
                type = mediaType === 'gif' ? 'video' : mediaType;
                break;
            }
        }

        if (!media) return await msg.reply('_Reply to an media_');
        let packname = config.PACKNAME;
        let author = 'whatsapp-bot';
        if (text) {
            const [pack, auth] = text.split('|');
            if (pack?.trim()) packname = pack.trim();
            if (auth?.trim()) author = auth.trim();
        }

        const stickerBuffer = await toSticker(type, media, { packname, author });
        await msg.send({ sticker: stickerBuffer });

});
