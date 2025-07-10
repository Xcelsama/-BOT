const { Module } = require('../lib/plugins');
const sticker = require('../lib/sticker');
const config = require('../config');

Module({
  command: 'take',
  package: 'media',
  description: 'change packname/author'
})(async (message, match) => {
  let mediaa = message.quoted || message;
  if (mediaa.type !== 'sticker') return await message.send('_Reply to a sticker_');
  let packname = config.packname;
  let author = config.author;
  if (match && match.includes('|')) {
    const parts = match.split('|');
    packname = parts[0].trim() || config.packname;
    author = parts[1].trim() || config.author;
  } const media = await mediaa.download();
  const buffer = await sticker.toSticker('image', media, {
    packname: packname,
    author: author
  });

  await message.send({ sticker: buffer });
});

Module({
  command: 'sticker',
  package: 'media',
  description: 'Convert stk'
})(async (message) => {
  let mediaa = message.quoted || message;
  if (!/image|video/.test(mediaa.type)) {
  return await message.send('_Reply to an image or video_'); }
  const media = await mediaa.download();
  const buffer = await sticker.toSticker(mediaa.type, media, {
  packname: config.packname,
  author: config.author
  });
  await message.send({ sticker: buffer });
});
