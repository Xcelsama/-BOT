const Instagram = require('../lib/Class/instagram');
const { Module } = require('../lib/plugins');
const UrlUtil = require('../lib/UrlUtil');

Module({
  command: 'insta',
  package: 'downloader',
  description: 'Download Instagram photo/video',
})(async (message, match) => {
  if (!match) return await message.send('ig url required');
  const ig = new Instagram();
  const res = await ig.get(match);
  if (!res.files.length || res.files[0].url === 'not found') return await message.send('err');
  for (const file of res.files) {
    if (file.type === 'mp4') {
      await message.send({ video: { url: file.url } }, { quoted: message });
    } else {
      await message.send({ image: { url: file.url } }, { quoted: message });
    }
  }
});

Module({
  on: 'text'
})(async (message) => {
  const urls = UrlUtil.extract(message.body);
  const ig = urls.find(url => url.includes('instagram.com'));
  if (!ig) return;
  const insta = new Instagram();
  const res = await insta.get(ig);
  if (!res.files.length || res.files[0].url === 'not found') return await message.send('err');
  for (const file of res.files) {
    if (file.type === 'mp4') {
      await message.send({ video: { url: file.url } }, { quoted: message });
    } else {
      await message.send({ image: { url: file.url } }, { quoted: message });
    }
  }
});
