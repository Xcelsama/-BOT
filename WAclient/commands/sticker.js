const { Command } = require('../../lib/');
const { makeSticker } = require('../../lib/Sticker');
const fs = require('fs');
var config = require('../../config');

Command({
    cmd_name: 'sticker',
    aliases: ['s'],
    category: 'converter',
    desc: 'Convert media to sticker'
})(async (msg) => {
        const buffer = msg.type === 'imageMessage' || msg.type === 'videoMessage' 
            ? await msg.download() 
            : msg.quoted?.type === 'imageMessage' || msg.quoted?.type === 'videoMessage'
            ? await msg.quoted.download()
            : null;

        if (!buffer) return msg.reply('Reply to an image/video');
        const stk = await makeSticker(buffer, {
            pack: config.PACKNAME
        });

        await msg.send({ 
            sticker: fs.readFileSync(stk)
        });
        
        fs.unlinkSync(stk);
});
