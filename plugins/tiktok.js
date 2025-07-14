const { Module } = require('../lib/plugins');
const TikTok = require('../lib/Class/tiktok');
const UrlUtil = require('../lib/UrlUtil');

Module({
  command: 'tiktok',
  package: 'downloader',
  description: 'Download tiktok videos'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a tiktok url_');
  if (!match.includes('tiktok.com') && !match.includes('vm.tiktok.com')) {
  return await message.send('_Please provide a valid tiktok url_'); }
  const tt = new TikTok();
  const result = await tt.download(match);
  if (result.status !== 200) return await message.send(`_${result.message || result.error}_`);
  const videoData = result.data;
  await message.send({video: { url: videoData.hdPlayUrl || videoData.playUrl }, caption: `*Title:* ${videoData.title}\n*Author:* ${videoData.nickname}`
  });  
});
    
Module({
  on: 'text',
})(async (message) => {
  const urls = UrlUtil.extract(message.body);
  const url = urls.find(u => u.includes('tiktok.com') || u.includes('vm.tiktok.com'));
  if (!url) return;
  const tt = new TikTok();
  const result = await tt.download(url);
  if (result.status !== 200) return await message.send(`_${result.message || result.error}_`);
  const video = result.data;
  await message.send({video: { url: video.hdPlayUrl || video.playUrl }, caption: `*Title:* ${video.title}\n*Author:* ${video.nickname}`
  });
});
