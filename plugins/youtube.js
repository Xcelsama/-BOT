const { Module } = require('../lib/plugins');
const ytSearch = require('yt-search');
const downloadMusicAndVideos = require('../lib/ytdl-dlp');
const tag = require('../lib/Class/metadata');

Module({
  command: 'song',
  package: 'downloader',
  description: 'Download audio from YouTube by URL or search query'
})(async (message, match) => {
  if (!match) return message.send('Provide a YouTube link or search query');
  const r = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/;
  let u = match;
  let x;
  if (!r.test(match)) {
    const s = await ytSearch(match);
    x = s.videos?.[0];
    if (!x) return message.send('nfound');
    u = x.url;
  }

  const d = await downloadMusicAndVideos(u);
  if (d.status !== 'success') return message.send(d.message);
  const id = x?.videoId || (u.match(/([0-9A-Za-z_-]{11})/) || [])[1];
  const a = d.url;
  const t = d.title;
  const n = x?.author.name;
  const { buffer, thumbUrl } = await tag(a, t, n, id);
  await message.send({document: buffer,mimetype: 'audio/mpeg',
    fileName: t + '.mp3',
    contextInfo: {externalAdReply: {title: t,body: 'Audio',mediaType: 2,thumbnailUrl: thumbUrl,mediaUrl: a,sourceUrl: a,renderLargerThumbnail: false
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
