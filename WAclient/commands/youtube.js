const { Command } = require('../../lib/command');
var { getYouTubeMP3} = require('./Func/yt.js');
const {AddMetadata} = require('./Func/Mp3Data');
const axios = require('axios');

Command({
    cmd_name: 'ytmp3',
    aliases: ['y2mate', 'yta'],
    category: 'downloader',
    desc: 'Download YouTube audio'
})(async (msg) => {
    var url = extractUrl(msg.text);
    if (!url && msg.quoted) {
        url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');
    }
    if (!url) return msg.reply('*_Please provide a YouTube URL_*');
    const data = await getYouTubeMP3(url);
    if (!data) return;
    const buffer = await AddMetadata(data.downloadUrl, data.thumbnail, { title: data.title });
    await msg.send({audio: buffer,mimetype: 'audio/mpeg', ptt: false,
    contextInfo: {externalAdReply: {title: data.title,body: 'YouTube MP3',thumbnailUrl: data.thumbnail,mediaType: 2,mediaUrl: url,sourceUrl: url
            }
        }
    });
});

Command({
  cmd_name: 'song',
  aliases: ['play'],
  category: 'downloader',
  desc: 'Download songs from YouTube'
})(async (msg) => {
   if (!msg.text) return msg.reply('Send a song name or link');
   let res = await axios.get(`https://downloaders-sandy.vercel.app/api/v1/yta?query=${msg.text}`);
   if (res.data.status !== 'true' || !res.data.data) return;
   let song = res.data.data;
   let reply = await msg.reply(`*Downloading: ${song.title}...*`);
   let audio = await AddMetadata(song.downloadUrl, song.thumbnail, { title: song.title, artist: song.uploader });
   await msg.send({audio, mimetype: 'audio/mpeg', contextInfo: {externalAdReply: {title: song.title,body: 'watch on',thumbnailUrl: song.thumbnail,mediaType: 1, mediaUrl: `https://www.youtube.com/watch?v=${song.videoId}`,sourceUrl: `https://www.youtube.com/watch?v=${song.videoId}`
   }
  }});
});
        
