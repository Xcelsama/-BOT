const { Command } = require('../../lib/command');
const {AddMetadata} = require('./Func/Mp3Data');
const axios = require('axios');

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
        
