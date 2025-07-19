const { Module } = require('../lib/plugins');
const yts = require('yt-search');
const { downloadMusicAndVideos } = require('../lib/ytdl-dlp');
const MetadataEditor = require('../lib/Class/metadata');

Module({
  command: 'song',
  package: 'downloader'
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
    { document: fb, fileName: `${result.title}.mp3`, mimetype: 'audio/mpeg' },
    {},
    'document'
  );
});
