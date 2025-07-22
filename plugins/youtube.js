const { Module } = require('../lib/plugins');
const ytSearch = require('yt-search');
const axios = require('axios');
const downloadMusicAndVideos = require('../lib/ytdl-dlp');

 
Module({    
  command: 'song',    
  package: 'downloader',    
  description: 'Download audio from YouTube by URL or search query'    
})(async (message, match) => {    
  if (!match) return message.send('Provide a YouTube link or search query');    
  const reg = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/;    
  let u = match;    
  if (!reg.test(match)) {    
    const s = await ytSearch(match);    
    const v = s.videos?.[0];    
    if (!v) return message.send('No results found');    
    u = v.url;    
  }    
    
     const r = await downloadMusicAndVideos(u);    
     if (r.status !== 'success') return message.send(r.message);    
     await message.send({document: { url: r.url },mimetype: 'audio/mpeg',fileName: r.title + '.mp3',contextInfo: {externalAdReply: {title: r.title,body: 'Ytdl-dlp',mediaType: 2,thumbnailUrl: 'https://i.ytimg.com/vi/' + r.url.split('v=')[1]?.substring(0, 11) + '/hqdefault.jpg',mediaUrl: r.url,sourceUrl: r.url,renderLargerThumbnail: false    
     }    
    }    
  }, { quoted: message});    
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
