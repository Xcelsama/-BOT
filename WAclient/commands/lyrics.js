const fetch= require('node-fetch');
const config = require('../../config');
var {Command} = require('../../lib/command');

Command({
  cmd_name: 'lyrics',
  category: 'music',
  desc: 'Get lyrics for a song'
})(async (msg) => {
  let args = msg.text;
  if (!args) return msg.reply('Please provide a song name or query, e.g., `.lyrics Dior by Pop Smoke`');
  let query = args;
  let url = `${config.API}/api/lyrics?q=${query}`;
  let res = await fetch(url);
  if (!res.ok) return;
  let data = await res.json();
  if (!data.[0].plainLyrics) return msg.reply('_nothing_');
  let caption = `*${data.trackName}*\n*Artist*: *${data.artistName}*\n\n${data.[0].plainLyrics}`.trim();
  if (caption.length > 4096) caption = caption.slice(0, 4093) + '...';
  await msg.send(caption);
});
