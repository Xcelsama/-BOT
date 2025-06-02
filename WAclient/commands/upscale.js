var { Command } = require('../../lib/');
const { extractUrl } = require('../../lib/Functions');
const axios = require('axios');

Command({
  cmd_name: 'upscale',
  aliases: ['enhance', 'hd'],
  category: 'tools',
  desc: 'Upscale/enhance image quality using AI'
})(async (msg) => {
  let img = extractUrl(msg.text);
  if (!img && msg.quoted) {
    if (msg.quoted.message?.imageMessage) {
      img = await msg.quoted.download();
    } else {
      const q = msg.quoted.message?.conversation || 
      msg.quoted.message?.extendedTextMessage?.text || '';
      img = extractUrl(q);
    }
  } if (!img) return msg.reply('_Please reply to an image or provide image url_');
    const x = await axios.get(`https://flowfalcon.dpdns.org/imagecreator/upscale?url=${img}`);
    if (x.data && x.data.status && x.data.result) {
      await msg.send({ 
        image: { url: x.data.result },
        caption: `*HD*`
      });
    } 
});
