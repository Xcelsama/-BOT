const { Command } = require('../../lib/command');
const { extractUrl } = require('../../lib/Functions');
var config = require('../../config');
const axios = require('axios');

Command({
  cmd_name: 'igdl',
  aliases: ['insta'],
  category: 'downloader',
  desc: 'Download Instagram post/reel'
})(async (msg) => {
  let url = extractUrl(msg.text);
  if (!url && msg.quoted) {
    url = extractUrl(
      msg.quoted.message?.conversation || 
      msg.quoted.message?.extendedTextMessage?.text || ''
    );
  }
  if (!url) return msg.reply('_Please provide Instagram url_');
  const res = await axios.get(`${config.API}/instagram/v5?url=${url}`);
  const data = res.data;
  if (!data || !data.downloadUrls || data.downloadUrls.length === 0)
  return;
  await msg.send(`*Downloading: ${data.title} wait...*`);
  if (data.downloadUrls.length === 1) {
    const med = data.downloadUrls[0];
    if (med.endsWith('.mp4')) {
      await msg.send({ video: { url: med }, caption: '*X ASTRAL*' });
    } else {
      await msg.send({ image: { url: med }, caption: '*X ASTRAL*' });
    }
  } else {
    for (const med of data.downloadUrls) {
      if (med.endsWith('.mp4')) {
        await msg.send({ video: { url: med } });
      } else {
        await msg.send({ image: { url: med } });
      }
    }
  }
});
