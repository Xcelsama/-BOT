const { Module } = require('../lib/plugins');
const ytSearch = require('yt-search');
const axios = require('axios');
const {ID3Writer} = require('browser-id3-writer');
const downloadMusicAndVideos = require('../lib/ytdl-dlp');

Module({
  command: 'song',
  package: 'downloader'
})(async (message, match) => {
  if (!match) return message.send('Send a song name or YouTube link');

  const ytMatch = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^\s&]+)/.exec(match);
  let u = match, title = '', author = '', id = '';

  if (!ytMatch) {
    const s = await ytSearch(match);
    const v = s.videos?.[0];
    if (!v) return message.send('Not found');
    u = v.url;
    title = v.title;
    author = v.author.name;
    id = v.videoId;
  } else {
    id = ytMatch[1];
    const s = await ytSearch({ videoId: id });
    const v = s.videos?.[0];
    if (v) {
      title = v.title;
      author = v.author.name;
    }
  }

  const r = await downloadMusicAndVideos(u);
  if (!r || r.status !== 'success') return message.send('Download failed');

  const audio = (await axios.get(r.url, { responseType: 'arraybuffer' })).data;
  const thumb = (await axios.get(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, { responseType: 'arraybuffer' })).data;

  const writer = new ID3Writer(audio);
  writer.setFrame('TIT2', title)
        .setFrame('TPE1', [author])
        .setFrame('APIC', { type: 3, data: thumb, description: 'Cover' })
        .addTag();
  const tagged = Buffer.from(writer.arrayBuffer);

  return await message.send({
    document: tagged,
    mimetype: 'audio/mpeg',
    fileName: title + '.mp3',
    contextInfo: {
      externalAdReply: {
        title,
        body: author,
        mediaType: 2,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        mediaUrl: 'https://tubidy.mobi',
        sourceUrl: 'https://tubidy.mobi',
        renderLargerThumbnail: false
      }
    }
  }, { quoted: message });
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
