const { Command } = require('../../lib/command');
const { Sticker } = require('wa-sticker-formatter');
var config = require('../../config');

Command({
    cmd_name: 'take',
    aliases: ['steal'],
    category: 'tools',
    desc: 'Convert'
})(async (msg, conn) => {
    const quoted = msg.quoted ? msg.quoted : msg;
    const mime = quoted.type || '';
    if (!/webp/.test(mime)) return msg.reply('_Reply to an sticker_');
    const [pack, author] = msg.text.split(',').map(x => x.trim());
    if (!pack || !author) return msg.reply('_usage:_ take Packname, Author');
    const media = await quoted.download();
    const sticker = new Sticker(media, {
    pack, author,type: 'full',quality: 70,
    background: 'transparent'
    });

    await msg.send({ sticker: await sticker.toBuffer() });
});


Command({
    cmd_name: 'crop',
    category: 'converter',
    desc: 'Convert media to cropped sticker'
})(async (msg, conn) => {
    const quoted = msg.quoted ? msg.quoted : msg;
    const mime = quoted.type || '';
    if (!/webp/.test(mime)) return msg.reply('_Reply to an sticker_');
    const media = await quoted.download();
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
    const quoted = msg.quoted ? msg.quoted : msg;
    const mime = quoted.type || '';
    if (!/webp/.test(mime)) return msg.reply('_Reply to an sticker_');
    const media = await quoted.download();
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
    const quoted = msg.quoted ? msg.quoted : msg;
    const mime = quoted.type || '';
    if (!/webp/.test(mime)) return msg.reply('_Reply to an stk_');
    const media = await quoted.download();
    const sticker = new Sticker(media, {
    pack: 'Made by',
    author: 'Xastral',
    type: 'default',
    removebg: true,
    quality: 70
    });
    await msg.send({ sticker: await sticker.toBuffer() });
});
