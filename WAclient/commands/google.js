const { Command } = require('../../lib/command');
const axios = require('axios');

Command({
  cmd_name: 'google',
  category: 'search',
  desc: 'Search something on Google'
})(async (msg, text) => {
  if (!text) return msg.reply('_Please provide a search query_');
  const url = `https://api.giftedtech.web.id/api/search/google?apikey=gifted&query=${text}`;
  const res = await axios.get(url).then(v => v.data).catch(() => null);
  if (!res || !res.success || !res.results?.length) return;
  let output = `*🔍 Google Search:* _${text}_\n\n`;
  for (let i = 0; i < Math.min(8, res.results.length); i++) {
    const result = res.results[i];
    output += `*${i + 1}. ${result.title}*\n${result.link}\n_${result.description}_\n\n`;
  }

  await msg.send(output.trim());
});
      
