var { Command } = require('../../lib/command');
var axios = require('axios');
const config = require('../../config');
var {AddMetadata} = require('./Func/Mp3Data');

Command({
  cmd_name: 'spotisearch',
  category: 'search',
  desc: 'Search for songs on Spotify'
})(async (msg) => {
  if (!msg.text) return msg.reply('Provide a song name to search.');
  let { data } = await axios.get(`${config.API}/Spotify/search?query=${msg.text}&limit=10`);
  if (!data || !data.length) return;
  let results = data.map((song, i) => `${i + 1}. *${song.title}* - ${song.artist}\n⏱ ${song.duration} | [Spotify](${song.url})`).join('\n\n');
  await msg.reply(`*Spotify Search:*\n\n${results}`);
});



Command({
  cmd_name: 'spotify',
  aliases: ['spdl'],
  category: 'downloader',
  desc: 'Download songs from Spotify'
})(async (msg) => {
  if (!msg.text) return msg.reply('Provide a valid Spotify track url');
  let { data } = await axios.get(`${config.API}/Spotify/download?url=${msg.text}`);
  if (!data || !data.download) return;
  let caption = `*Title:* ${data.title}\n*Duration:* ${(data.duration / 1000).toFixed(0)} seconds`;
  await msg.send({ image: { url: data.cover }, caption });
  let mp3Buffer = await AddMetadata(data.download, data.cover, { 
    title: data.title, 
    artist: data.artist, 
  });

  await msg.send({ audio: mp3Buffer, mimetype: 'audio/mpeg'});
});
