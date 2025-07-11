const { Module } = require('../lib/plugins');
const axios = require('axios');

Module({
  command: 'ssweb',
  package: 'tools',
  description: 'Full-page web screenshot'
})(async (message, match) => {
  let url = match?.trim() || message.quoted?.body?.trim();
  if (!/^https?:\/\//i.test(url)) return await message.send('_ssweb <url> or reply to url_');
  const link = `https://image.thum.io/get/width/1200/crop/900/fullpage/${url}`;
  const img = (await axios.get(link, { responseType: 'arraybuffer' })).data;
  await message.send({ image: img });
});
