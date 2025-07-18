const { Module } = require('../lib/plugins');
const yts = require('yt-search');
const xbuddy = require('./xbuddy'); 

Module({
  command: 'song',
  description: 'Download audio from YouTube (via URL or search)',
  category: 'downloader',
}, async (message, match) => {
  if (!match) return await message.send('Send a song name or YouTube link.');
  let url = match;
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    const search = await yts(match);
    if (!search || !search.videos.length) return await message.send('No song found.');
    url = search.videos[0].url;
  }

  try {
    const buffer = await xbuddy.downloadVideo(url, '144p'); 
    if (!buffer) return await message.send('Download failed.');

    await message.send({ audio: buffer, mimetype: 'audio/mp4' }, { quoted: message.data });
  } catch (err) {
    console.error(err);
    await message.send('Failed to download audio.');
  }
});
