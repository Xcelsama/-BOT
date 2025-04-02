var { Command } = require('../../lib/command');
var axios = require('axios');
const config = require('../../config');
var {AddMetadata} = require('./Func/Mp3Data');

Command({
  cmd_name: 'spotisearch',
  category: 'search',
  desc: 'Search for songs on Spotify'
})(async (msg) => {
  if (!msg.text) return msg.reply('_Provide a song name to search_');
  let { data } = await axios.get(`${config.API}/Spotify/search?query=${msg.text}&limit=12`);
  if (!data || !data.length) return;
  let results = data.map((song, i) => `*${i + 1}${song.title}*\n*▢Artist:*${song.artist}\n*▢${song.duration}*\n*▢[Spotify]*\n${song.url}`).join('\n\n');
  await msg.reply(`*Spotify Search:*\n\n${results}`);
});



Command({
  cmd_name: 'spotify',
  aliases: ['spdl'],
  category: 'downloader',
  desc: 'Download songs from Spotify'
})(async (msg) => {
  if (!msg.text) return msg.reply('_Provide a valid Spotify track url_');
  let { data } = await axios.get(`${config.API}/Spotify/download?url=${msg.text}`);
  if (!data || !data.download) return;
  let caption = `*Title:* ${data.title}\n*Duration:* ${(data.duration / 1000).toFixed(0)} seconds`;
  await msg.send({ image: { url: data.cover }, caption });
  let mp3Buffer = await AddMetadata(data.download, data.cover, { 
    title: data.title, 
    artist: data.artist, 
  });

  await msg.send({ audio: mp3Buffer, mimetype: 'audio/mpeg', contextInfo: {externalAdReply: {title: data.title,body: 'Astral',mediaType: 1,thumbnailUrl: data.cover,sourceUrl: msg.text}}
  });
                  
});
