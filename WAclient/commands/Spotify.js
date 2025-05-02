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
  let results = data.map((song, i) => `${i + 1} *${song.title}*\n*▢Artist:*${song.artist}\n*▢${song.duration}*\n*▢[Spotify]*\n${song.url}`).join('\n\n');
  await msg.reply(`*Spotify Search:*\n\n${results}`);
});



Command({
  cmd_name: 'spotify',
  aliases: ['spdl', 'spoti'],
  category: 'downloader',
  desc: 'Download songs from Spotify'
})(async (msg) => {
  var ytdl = msg.text;
  if (!ytdl) return msg.reply('_Provide a valid Spotify track url_');
  let { data } = await axios.get(`${config.API}/Spotify/download?url=${ytdl}`);
  if (!data || !data.download) return;
  let mp3Buffer = await AddMetadata(data.download, data.cover, { 
    title: data.title, 
    artist: data.artist, 
  });

  await msg.send({ audio: mp3Buffer, mimetype: 'audio/mpeg', contextInfo: {externalAdReply: {title: data.title,body: 'Astral',mediaType: 1,thumbnailUrl: data.cover,sourceUrl: ytdl}}
  });
                  
});
