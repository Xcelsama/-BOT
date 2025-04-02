var { Command } = require('../../lib/command');
var axios = require('axios');
const config = require('../../config');
var {AddMetadata} = require('./Func/Mp3Data');

Command({
  cmd_name: 'spotifydl',
  aliases: ['spdl'],
  category: 'downloader',
  desc: 'Download songs from Spotify'
})(async (msg) => {
  if (!msg.text) return msg.reply('Provide a valid Spotify track url');
  let { data } = await axios.get(`${config.API}/Spotify/download?url=${msg.text}`);
  if (!data || !data.download) return;
  let caption = `*Title:* ${data.title}\n*Artist:* ${data.artist}\n*Duration:* ${(data.duration / 1000).toFixed(0)} seconds`;
  await msg.send({ image: { url: data.cover }, caption });
  let mp3Buffer = await AddMetadata(data.download, data.cover, { 
    title: data.title, 
    artist: data.artist, 
  });

  await msg.send({ audio: mp3Buffer, mimetype: 'audio/mpeg'});
});
