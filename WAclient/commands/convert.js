const {Command} = require('../../lib/command');
const sharp = require('sharp');

Command({
    cmd_name: 'toimg',
    aliases: ['toimage'],
    category: 'converter',
    desc: 'Convert sticker to image'
})(async (msg) => {
    if (!msg.quoted) return msg.reply('_Reply to a sticker_');
    if (!/webp/.test(msg.quoted.type)) return msg.reply('_Reply to a sticker_');
    const media = await msg.quoted.download();
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
    buffer = Buffer.concat([buffer, chunk]);}
    const ctx = await sharp(buffer)
    .toFormat('png')
    .toBuffer();
    await msg.send({ image: ctx });
});

Command({
    cmd_name: 'tomp3',
    aliases: ['mp3'],
    category: 'converter',
    desc: 'Convert video to mp3'
})(async (msg) => {
    if (!msg.quoted) return msg.reply('_Reply to a video_');
    if (!/video/.test(msg.quoted.type)) return msg.reply('_Reply to a video_');
    const media = await msg.quoted.download();
    let buffer = Buffer.from([]);
    for await (const chunk of media) {
    buffer = Buffer.concat([buffer, chunk]);
    }
    await msg.send({ audio: buffer,mimetype: 'audio/mp3'});
});
