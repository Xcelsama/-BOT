const { Module } = require('../lib/plugins');
const axios = require('axios');
const ID3 = require('node-id3');
const yts = require('yt-search');
const downloadMusicAndVideos = require('../lib/ytdl-dlp');

Module({ command: 'song', package: 'downloader', description: 'Download audio' })(async (message, match) => {
  if (!match) return message.send('Provide a YouTube link or search query');
  const r = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/.test(match) ? match : (await yts(match)).videos?.[0]?.url;
  if (!r) return message.send('nfound');
  const x = await downloadMusicAndVideos(r); if (x.status !== 'success') return message.send(x.message);
  const a = Buffer.from((await axios.get(x.url, { responseType: 'arraybuffer' })).data);
  const t = x.url.split('v=')[1]?.slice(0, 11);
  const i = Buffer.from((await axios.get(`https://i.ytimg.com/vi/${t}/hqdefault.jpg`, { responseType: 'arraybuffer' })).data);
  const meta = ID3.write({ title: x.title, artist: x.author, album: 'Audio', comment: { text: 'Garfield' }, image: { mime: 'image/jpeg', type: { id: 3, name: 'front cover' }, imageBuffer: i } }, a);
  await message.send({ document: meta, mimetype: 'audio/mpeg', fileName: `${x.title}.mp3`, contextInfo: { externalAdReply: { title: x.title, body: x.author, mediaType: 2, thumbnailUrl: `https://i.ytimg.com/vi/${t}/hqdefault.jpg`, mediaUrl: 'www.tubidy.mobi', sourceUrl: 'www.tubidy.mobi', renderLargerThumbnail: false } } }, { quoted: message});
});

/*Module({
  command: 'play',
  package: 'downloader',
  description: 'Play music or video from query'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a search query_');
  const result = await ytSearch(match);
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
*/
