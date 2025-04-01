var { Command } = require('../../lib/command'); 
var axios = require('axios');

Command({ cmd_name: 'song', aliases: ['play'], category: 'downloader', desc: 'Download songs from YouTube' })(async (msg) => {
  if (!msg.text) return msg.reply('Please provide a song name or YouTube link.');
  let { data } = await axios.get(`https://downloaders-sandy.vercel.app/api/v1/yta?query=${msg.text}`);
  if (data.status !== 'true' || !data.data) return;
  await msg.reply(`*Downloading: ${data.data.title}...*`);
  await msg.send({ audio: { url: data.data.downloadUrl }, mimetype: 'audio/mpeg', contextInfo: { externalAdReply: { title: data.data.title, body: 'watch on', thumbnailUrl: data.data.thumbnail, mediaType: 1, mediaUrl: `https://www.youtube.com/watch?v=${data.data.videoId}`, sourceUrl: `https://www.youtube.com/watch?v=${data.data.videoId}` } } });
});
                  
