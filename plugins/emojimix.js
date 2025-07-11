const { Module } = require('../lib/plugins');
const axios = require('axios');
const sticker = require('../lib/sticker');
const config = require('../config');

Module({
  command: 'emojimix',
  package: 'media',
  description: 'Combine 2 emojis'
})(async (message, match) => {
  const [emoji1, emoji2] = match?.split(' ') || [];
  if (!emoji1 || !emoji2) return await message.send('_eg: emojimix 🙂 🙃_');
  const url = `https://toxicdevilapi.vercel.app/other/emoji-mix?emoji1=${emoji1}&emoji2=${emoji2}`;
  const res = await axios.get(url);
  const result = res.data?.result?.[0];
  if (!result) return await message.send('_err_');
  const image = (await axios.get(result, { responseType: 'arraybuffer' })).data;
  const buffer = await sticker.toSticker('image', image, {
    packname: config.packname,
    author: config.author
  });
  await message.send({ sticker: buffer });
});
