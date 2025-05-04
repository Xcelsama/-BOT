const { Command } = require('../../lib/command');
var config = require('../../config');
const {AddMetadata} = require('./Func/Mp3Data');
let {extractUrl} = require('../../lib/Functions');
const axios = require('axios');
const ytSearch = require('yt-search');

Command({
  cmd_name: 'yts',
  category: 'search',
  desc: 'Search YouTube videos',
})(async (msg) => {
  const args = msg.text;
  if (!args) return msg.reply('Please provide a search term');
  const { videos } = await ytSearch(args);
  if (!videos.length) return;
  const results = videos.slice(0, 5).map(
    ({ title, videoId, views, timestamp: duration, ago: published, author }, i) =>
      `*${i + 1}.* ${title}\n${author.name}\n${duration}\n${views} views\n${published}\nhttps://www.youtube.com/watch?v=${videoId}`
  ).join('\n\n');

  await msg.send(`*YouTube Search:*\n\n${results}`);
});

Command({
  cmd_name: 'ytmp3',
  aliases: ['yta'],
  category: 'downloader',
  desc: 'Download songs from YouTube'
})(async (msg) => {
   var url = extractUrl(msg.text);
    if (!url && msg.quoted) {
        url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');
    }
   if (!url) return msg.reply('*_Please provide a YouTube URL_*');  
   let res = await axios.get(`https://downloaders-sandy.vercel.app/api/v1/yta?query=${url}`);
   if (res.data.status !== 'true' || !res.data.data) return;
   let song = res.data.data;
   let reply = await msg.reply(`*Downloading: ${song.title}...*`);
   let audio = await AddMetadata(song.downloadUrl, song.thumbnail, { title: song.title, artist: song.uploader });
   await msg.send({audio, mimetype: 'audio/mpeg', contextInfo: {externalAdReply: {title: song.title,body: 'watch on',thumbnailUrl: song.thumbnail,mediaType: 1, mediaUrl: `https://www.youtube.com/watch?v=${song.videoId}`,sourceUrl: `https://www.youtube.com/watch?v=${song.videoId}`
   }
  }});
});        

Command({
  cmd_name: 'song',
  aliases: ['play'],
  category: 'downloader',
  desc: 'Download songs from YouTube'
})(async (msg) => {
  let query = msg.text;
  if (!msg.text) return msg.reply('_Provide a song name eg .song Big dawgs by HummanKind_');
  let vid = query;
  if (!query.startsWith('http')) {
    let search = await ytSearch(query);
    if (!search.videos.length) return msg.reply('_Noti found_');
    vid = search.videos[0].url;
  } let song, audiobuff;
  try { let res = await axios.get(`https://downloaders-sandy.vercel.app/api/v1/yta?query=${vid}`);
    if (res.data.status === 'true' && res.data.data) {
      song = res.data.data;
      let metadata = await AddMetadata(song.downloadUrl, song.thumbnail, {
      title: song.title,
      artist: song.uploader || 'YouTube'
      });
      audiobuff = metadata;
    } else {
    }} catch {
    try { let fallback = await axios.get(`${config.API}/api/download?url=${vid}&type=audio`);
      song = fallback.data;
      audiobuff = { url: song.url }; 
    } catch { return;
    }}
   await msg.reply(`*Downloading:* ${song.title}...`);
   await msg.send({audio: audiobuff,mimetype: 'audio/mpeg',contextInfo: {externalAdReply: {title: song.title,body: 'YouTube Audio',thumbnailUrl: song.thumbnail || '',mediaType: 1,mediaUrl: vid,sourceUrl: vid
   }
 }});
});

Command({
  cmd_name: 'ytmp4',
  aliases: ['ytv'],
  category: 'downloader',
  desc: 'Download YouTube videos'
})(async (msg) => {
  let tourl = extractUrl(msg.text);
    if (!tourl && msg.quoted) {
        tourl = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');
    }
    if (!tourl) return msg.reply('_Provide a yt url please_');
    let { data } = await axios.get(`${config.API}/api/download`, {
      params: {
        url: tourl,
        type: 'video'
      }
    });
    if (!data?.url) return;
    await msg.reply(`*Downloading:* ${data.title}...`);
    let caption = `===[YOUTUBE]===\n${data.title}\n${data.size}\n\nMade with❤️`;
    await msg.send({video: { url: data.url },caption,mimetype: 'video/mp4'});
});  
