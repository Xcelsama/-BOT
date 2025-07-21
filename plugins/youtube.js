const axios = require('axios');
const ID3 = require('node-id3');
const ytSearch = require('yt-search');
const { Module } = require('../lib/plugins');
const downloadMusicAndVideos = require('../lib/ytdl-dlp');

const getVid = u => u.match(/(?:v=|youtu\.be\/|\/shorts\/)([\w-]{11})/)?.[1]||null;
Module({command:'song',package:'downloader',description:'Download audio'})(async(message,match)=>{ 
if(!match) return message.send('Provide a link or query'); let url=match; if(!/(youtu\.be|youtube\.com)/.test(match)){ 
const s = await ytSearch(match); const v = s.videos?.[0]; if(!v)return message.send('nothin'); url=v.url;}
const s = await ytSearch(url),v=s.videos?.[0]||{},vid=v.videoId||getVid(url);if(!vid)return message.send('invalid id_'); const r=await downloadMusicAndVideos(url);if(r.status!=='success')return message.send(r.message);
const audio=Buffer.from((await axios.get(r.url,{responseType:'arraybuffer'})).data);const img=Buffer.from((await axios.get(`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,{responseType:'arraybuffer'})).data);const out=ID3.write({title:r.title,artist:v.author?.name||'garfield',album:'Audio',image:{mime:'image/jpeg',type:{id:3,name:'cover'},imageBuffer:img}},audio);
await message.send({audio:out,mimetype:'audio/mpeg',fileName:r.title+'.mp3',contextInfo:{externalAdReply:{title:r.title,body:v.author?.name||'garfield',mediaType:2,thumbnailUrl:`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,mediaUrl:'www.tubidy.mobi',sourceUrl:'www.tubidy.mobi',renderLargerThumbnail:false}}},{quoted:message});});

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
