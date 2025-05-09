var { Command } = require('../../lib/command');
const Genius = require("genius-lyrics");
var Client = new Genius.Client("R5uWMyI9qQP9v3BGM0U0rfjH3LoT_Trg6jeMhA_nCKmYENCTuSdOdhi0CvTzCm2R");

Command({
  cmd_name: 'lyrics',
  category: 'music',
  desc: 'Get lyrics for a song'
})(async (msg) => {
  let args = msg.text;
  if (!args) return msg.reply('Please provide a song name or query, e.g., `.lyrics Dior by Pop Smoke`');
  var find = await Client.songs.search(args);
  var x = find[0];
  var ctx = x._raw.header_image_url
  var title = x._raw.primary_artist_names + " - " + x._raw.title
  var lyrics = await x.lyrics();
  await msg.send({ image:{ url:ctx},caption: title + "\n\n" + lyrics });
 });
