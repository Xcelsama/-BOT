const { Command } = require('../../lib/command');
const { Sticker } = require('wa-sticker-formatter');
var config = require('../../config');



Command({
    cmd_name: 'take',
    category: 'tools',
    desc: 'Convert',
})(async (msg) => {
        if (!msg.quoted || !msg.quoted.message) return await msg.reply('_Reply to a sticker_');
        var match = msg.text;
        let pack = config.PACKNAME;
        let author = 'NᴀxᴏʀDᴇᴠɪ';
        if (match) { if (!match.includes('|')) return await msg.reply('_use the correct format: `packname|author`_');
        let [ux, us] = match.split('|').map((v) => v.trim());
        if (!ux || !us) return await msg.reply('_Both packname and author must be provided in the format: `packname|author`_');
        pack = ux;
        author = us; }
        const buffer = await msg.quoted.download();
        if (!buffer) return;
        const sticker = new Sticker(buffer, {
        pack,author,type: 'full',quality: 80,id: 'sticker_cmd',background: 'transparent'
        });
        const voidi = await sticker.toBuffer();
        await msg.send({ sticker: voidi });
});

    

Command({
    cmd_name: 'crop',
    category: 'converter',
    desc: 'Convert media to cropped sticker'
})(async (msg, conn) => {
    if (!msg.quoted) return msg.reply('_Reply to an sticker_');
    const media = await msg.quoted.download();
    const sticker = new Sticker(media, {
    pack: 'Created By', author: 'Xastral',
    type: 'crop',quality: 70,
    background: 'transparent'
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});

Command({
    cmd_name: 'circle',
    category: 'converter',
    desc: 'Convert media to circular sticker'
})(async (msg, conn) => {
    if (!msg.quoted) return msg.reply('_Reply to an sticker_');
    const media = await msg.quoted.download();
    const sticker = new Sticker(media, {
    pack: `${config.PACKNAME}`, author: `${msg.pushName}`,
    type: 'circle', quality: 70,
    background: 'transparent'
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});

Command({
    cmd_name: 'transparent',
    category: 'converter',
    desc: 'Convert'
})(async (msg, conn) => {
    if (!msg.quoted) return msg.reply('_Reply to an stk_');
    const media = await msg.quoted.download();
    const sticker = new Sticker(media, {
    pack: 'Made by',
    author: 'Xastral',
    type: 'default',
    removebg: true,
    quality: 70
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});
