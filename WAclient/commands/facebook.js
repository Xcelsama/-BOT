var { Command } = require('../../lib/command');
var axios = require('axios');

Command({
  cmd_name: 'fb',
  aliases: ["facebook"],
  category: 'downloader',
  desc: 'Download Facebook videos'
})(async (msg) => {
  if (!msg.text) return msg.reply('Please provide a fb url');
  let { data } = await axios.get(`https://diegoson-naxordeve.hf.space/facebook?url=${msg.text}`);
  if (data.status !== 200 || !data.data) return;
  let vid = data.data['720p (HD)'] || data.data['360p (SD)'];
  if (!vid) return;
  await msg.send({video: { url: vid }, caption: `🔹*Quality:* ${data.data['720p (HD)'] ? 'HD (720p)' : 'SD (360p)'}\n🔹*X ASTRAL*`});
});
