let config = require('../../config');
var {Command} = require('../../lib/command');
const axios = require('axios');

Command({
  cmd_name: 'flux',
  aliases: ['flax'],
  category: 'ai gen',
  desc: 'Generate image using Flux AI'
})(async (msg) => {
  if (!msg.text) return msg.reply('Please provide a prompt');
  const res = await axios.get(`${config.API}/flux-pro?prompt=${msg.text}`);
  const Json = res.data?.data?.imageUrl;
  if (!Json) return;
  await msg.send({ image: { url: Json }, caption: '*FLUX PRO*' });
});
