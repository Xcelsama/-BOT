const { Module } = require('../lib/plugins');
const Facebook = require('../lib/Class/facebook');
const UrlUtil = require('../lib/UrlUtil');

Module({
  command: 'fb',
  package: 'downloader',
  description: 'Download Facebook videos'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a fb url_');
  if (!match.includes('facebook.com') && !match.includes('fb.watch')) {
  return await message.send('_Please provide a valid fb url_'); }
  const fb = new Facebook();
  const result = await fb.download(match);
  if (result.status !== 200) return await message.send(`_${result.message || result.error}_`);
  const dls = result.data;
  const qualities = Object.keys(dls);
  if (qualities.length === 0) return await message.send('_🐱_');
  const qp = qualities.find(q => q.includes('HD')) || qualities[0];
  const downloadUrl = dls[qp];
  await message.send({ video: { url: downloadUrl }, caption: `*Quality:* ${qp}` });
});

Module({
  on: 'text'
})(async (message) => {
  const urls = UrlUtil.extract(message.body);
  const fbUrl = urls.find(url => url.includes('facebook.com') || url.includes('fb.watch'));
  if (!fbUrl) return;
  const fb = new Facebook();
  const result = await fb.download(fbUrl);
  if (result.status !== 200) return await message.send(`_${result.message || result.error}_`);
  const dls = result.data;
  const qualities = Object.keys(dls);
  if (!qualities.length) return;
  const quality = qualities.find(q => q.includes('HD')) || qualities[0];
  await message.send({
    video: { url: dls[quality] },
    caption: `*Quality:* ${quality}`
  });
});
