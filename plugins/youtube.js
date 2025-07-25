const fs = require('fs');
const axios = require('axios');
const yts = require('yt-search');
const { Module } = require('../lib/plugins');
const { DownloadMusic,DownloadVideo } = require('yt-streamer');

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

Module({
  command: 'play',
  package: 'downloader',
  description: 'Play music or video from query'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a search query_');
  const result = await yts(match);
  if (!result || !result.videos.length) return await message.send('_nofound_');
  const v = result.videos[0];
  const thumb = (await axios.get(v.thumbnail, { responseType: 'arraybuffer' })).data;
  await message.send(
    {image: Buffer.from(thumb),caption: `*${v.title}*\n\n*🔢Reply with number:*\n\`\`\`\n◆ 1. Audio\n◆ 2. Document\n◆ 3. Video\n\`\`\``,contextInfo: {
        externalAdReply: {
          title: v.title,body: '',mediaType: 1,mediaUrl: v.url,renderLargerThumbnail: true,
          thumbnail: Buffer.from(thumb)
        }}
    },
    { quoted: message });
});

Module({ on: 'text' })(async (message) => {
  if (!message.quoted) return;
  const urls = (message.quoted.text || message.quoted.body || '').match(/https?:\/\/[^\s]+/g);
  if (!urls || !urls.length) return;
  const url = urls[0];
  const q = message.body.replace(/[^1-3]/g, '').trim();
  if (!['1', '2', '3'].includes(q)) return;
  const id = url.includes('v=') ? url.split('v=')[1] : url.split('/').pop();
  const result = await yts({ videoId: id });
  if (!result) return;
  const title = result.title;
  let file;
  if (q === '3') file = await DownloadVideo(id);
  else file = await DownloadMusic(id);
  const buffer = fs.readFileSync(file);
  const size = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
  if (q === '1') {
  await message.send({ audio: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` });
  } else if (q === '2') {
  await message.send({ document: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` });
  } else if (q === '3') {
  await message.send({ video: buffer, mimetype: 'video/mp4', fileName: `${title}.mp4`, caption: `*${title}*\n*${size} MB*\n*${id}*` });}
  fs.unlinkSync(file);
});
