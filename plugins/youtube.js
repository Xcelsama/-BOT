const yt = require('yt-search');
const ytdl = require('../lib/download');
const { Module } = require('../lib/plugins');

Module({
  command: 'song',
  package: 'downloader',
  description: 'Search and download a song',
})(async (message, match) => {
  if (!match) return message.send('Please provide a song name or yt url');
  let link = match;
  if (!/youtu\.be|youtube\.com/.test(match)) {
  const res = await yt(match);
  if (!res.videos.length) return message.send('_not found_');
  link = res.videos[0].url;
  }

  const save = new ytdl();
  const res = await save.down(link, 'mp3');
  if (!res.status) return message.send(res.error);
  await message.send({ audio: { url: res.result.download }, mimetype: 'audio/mpeg' }, { quoted: message });
});
