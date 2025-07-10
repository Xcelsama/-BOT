const { Module } = require('../lib/plugins');
const sticker = require('../lib/sticker');
const config = require('../config');

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
