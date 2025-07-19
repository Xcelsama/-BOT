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
  return message.send({ document: fb, fileName: `${result.title}.mp3`, mimetype: 'audio/mpeg' },{quoted: message})
});

Module({
  command: 'play',
  package: 'downloader',
  description: 'Play music or video from query'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a search query_');
  const result = await yts(match);
  if (!result.videos.length) return await message.send('nofound');
  const video = result.videos[0];
  await message.send({
    image: { url: video.thumbnail },
    caption: `*${video.title}*\n\`\`\`\n◆ 1. Audio\n◆ 2. Document\n◆ 3. Video\n\`\`\`\n\n${video.url}\n\nReply with num`
  }, { quoted: message });
});

Module({
  on: 'text'
})(async (message) => {
  if (!message.quoted) return;
  if (!message.quoted.body?.includes('◆')) return;
  const urls = (message.quoted.text || message.quoted.body || '').match(/https?:\/\/[^\s]+/g);
  if (!urls || !urls.length) return;
  const q = message.body.replace('◆', '').trim();
  const url = urls[0];
  const info = await downloadMusicAndVideos(url);
  if (q === '1' || q === '2') {
    const meta = new MetadataEditor();
    const mp = await meta.write(info.url, info.thumb, { title: info.title });
    if (q === '1') {
      return await message.send({ audio: mp, mimetype: 'audio/mpeg' }, { quoted: message });
    }
    if (q === '2') {
      return await message.send({
        document: mp,
        mimetype: 'audio/mpeg',
        fileName: `${info.title}.mp3`
      }, { quoted: message });
    }
  }
  if (q === '3') {
    return await message.send({
      video: { url: info.url },
      mimetype: 'video/mp4',
      caption: info.title
    }, { quoted: message });
  }
});
