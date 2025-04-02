const { Command } = require('../../lib/command');
const { extractUrl } = require('../../lib/Functions');
const axios = require('axios');

Command({
  cmd_name: 'igdl',
  aliases: ['instadl'],
  category: 'media',
  desc: 'Download Instagram post/reel '
})(async (msg) => {
  const url = extractUrl(msg.text);
  if (!url && msg.quoted) {
      url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || '');
  }if (!url) return msg.reply('_Please provide Instagram url_');
  const res = await axios.get(`https://diegoson-naxordeve.hf.space/instagram/v5?url=${url}`);
  if (!res.data || !res.data.downloadUrls) return;
  const data = res.data;
  await msg.send({image: { url: data.thumbnail }, caption: `*${data.title}*\n\n_Wait..._` });
  await msg.send({ video: { url: data.downloadUrls[0] }, caption: '*X ASTRAL*' });
});
