const fs = require('fs');
const yts = require('yt-search');
const { Module } = require('../lib/plugins');
const { DownloadVideo } = require('yt-streamer');

Module({
  command: 'ytmp4',
  package: 'downloader',
  description: 'Download YouTube videos'
})(async (message, match) => {
  let q = match;
  if (!q) return await message.send('_Please provide a yt link or search query_');
  let u = q;
  if (!q.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//)) {
  const s = await yts(q);
  if (!s || !s.videos.length) return await message.send('_not_found_');
  u = s.videos[0].url; }
  const id = u.split("v=")[1]?.split("&")[0] || u.split("/").pop();
  const wait = await message.send('_Downloading video..._');
  const p = await DownloadVideo(id);
  const v = fs.readFileSync(p);
  const stat = fs.statSync(p);
  const mb = (stat.size / 1024 / 1024).toFixed(2);
  const title = p.split('/').pop().replace(/\.mp4$/, '');
  await message.send({video: v,mimetype: 'video/mp4',fileName: `${title}.mp4`,caption: `*${title}*\n*${mb} MB*`});
  fs.unlinkSync(p);
});
