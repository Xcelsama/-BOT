const { Module } = require('../lib/Module');
const { toSticker } = require('../lib/Sticker');

Module({
    command: 'sticker',
    package: 'media',
    description: 'Convert image/video to sticker',
    aliases: ['s', 'stiker']
})(async (conn, msg) => {
        let media;
        let mediaType;
        if (msg.quoted && (msg.quoted.mtype === 'imageMessage' || msg.quoted.mtype === 'videoMessage')) {
            media = await msg.quoted.download();
            mediaType = msg.quoted.mtype === 'imageMessage' ? 'image' : 'video';
        } else {
        return msg.reply('*Reply to an image or video*'); }
        if (!media) return;
        const sti = await toSticker(mediaType, media, { packname: 'Memoji', author: 'Apple' });
        if (sti) {
        await msg.send(sti, 'sticker');
        } 
});
