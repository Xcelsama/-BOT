const { Module } = require('../lib/plugins');
const sticker = require('../lib/sticker');
const config = require('../config');

Module({
  command: 'take',
  package: 'media',
  description: 'Change sticker packname and author'
})(async (message, match) => {
  let mediaa = message.quoted || message;
  if (mediaa.type !== 'stickerMessage') return await message.send('_Reply to a sticker_');
  const [packname, author] = match?.split('|').map(s => s.trim()) || [];
  if (!packname || !author) return await message.send('_use: take new pack | new author_');
  const media = await mediaa.download();
  const buffer = await sticker.addExif(media, {
    packname,
    author
  });

  await message.send({ sticker: buffer });
});

Module({
  command: 'sticker',
  package: 'media',
  description: 'Convert stk'
})(async (message) => {
  let mediaa = message.quoted || message;
  if (!/image|video|gif/.test(mediaa.type)) {
  return await message.send('_Reply to an image or video_'); }
  const media = await mediaa.download();
  const buffer = await sticker.toSticker(mediaa.type, media, {
  packname: config.packname,
  author: config.author
  });
  await message.send({ sticker: buffer });
});
