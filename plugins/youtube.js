const { Module } = require('../lib/plugins');
const yts = require('yt-search');
const { downloadMusicAndVideos } = require('../lib/ytdl-dlp');
const MetadataEditor = require('../lib/Class/metadata');

Module({
  command: 'song',
  package: 'downloader',
  description: 'Download YouTube audio'
})(async (message, match) => {
  if (!match) return message.send('_yt url nor query_');
  const reg = /\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&|^?]+)/;
  let vid;
  if (reg.test(match)) {
    vid = match;
  } else {
    const search = await yts(match);
    if (!search?.videos?.length) return message.send('no found');
    vid = search.videos[0].url;
  } const result = await downloadMusicAndVideos(vid);
  if (result.status !== 'success') return message.send('err');
  const meta = new MetadataEditor();
  const fb = await meta.write(result.url, result.thumb, { title: result.title });
  return message.send(
    { document: fb, fileName: `${result.title}.mp3`, mimetype: 'audio/mpeg' },{quoted: message})
});
Module({
  command: 'play',
  package: 'downloader',
  description: 'Play music or video from query'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a search q_');
  const result = await yt(match);
  if (!result.videos.length) return await message.send('nothin');
  const video = result.videos[0];
  const info = await downloadMusicAndVideos(video.url);
  const caption = `*${info.title}*\n\`\`\`\n◆ 1. *Audio*\n◆ 2. *Document*\n◆ 3. *Video*\n\`\`\`\n\n${video.url}\n\nReply with num`;
  return await message.send({image: { url: info.thumb },caption}, { quoted: message });
});

Module({
  on: 'text'
})(async (message) => {
  const UrlUtil = require('../lib/UrlUtil');
  if (!message.quoted) return;
  if (!message.body.includes('◆')) return;
  let q = message.body.replace('◆', '').trim();
  const urls = UrlUtil.extract(message.quoted.text || message.quoted.body || '');
  if (!urls.length) return;
  const url = urls[0];
  const info = await downloadMusicAndVideos(url);
  if (q === '1' || q === '2') {
    const meta = new MetadataEditor();
    const mp = await meta.write(info.url, info.thumb, { title: info.title });
    if (q === '1') return await message.send({ audio: mp, mimetype: 'audio/mpeg' }, { quoted: message });
    if (q === '2') {
      return await message.send({document: mp,mimetype: 'audio/mpeg',fileName: `${info.title}.mp3`
      }, { quoted: message });
    }
  }
  if (q === '3') {
    return await message.send({ video: { url: info.url }, mimetype: 'video/mp4', caption: info.title }, { quoted: message });
  }
});
