const { snackSearch,snackDownload } = require('./Func/snack');
const axios = require("axios");
let {Command} = require('../../lib/command');

Command({
  cmd_name: 'snacksearch',
  aliases: ['snacks', 'snackfind'],
  category: 'search',
  desc: 'Search SnackVideo videos'
})(async (msg) => {
  const query = msg.text;
  if (!query) return msg.reply('*_Please provide a search term_*');
  const results = await snackSearch(query);
  if (!results.length) return;
  let text = '*SnackVideo Search:*\n\n';
  for (let i = 0; i < Math.min(results.length, 5); i++) {
    const v = results[i];
    text += `*${i + 1}.* ${v.title}\n*By:* ${v.author.name}\n*Likes:* ${v.stats.likes}\n*Views:* ${v.stats.watch}\n*Link:* ${v.url}\n\n`;
  }
  await msg.send({ text });
});
    
Command({
  cmd_name: 'snack',
  aliases: ['snackvideo', 'snackdl'],
  category: 'downloader',
  desc: 'Download SnackVideo video'
})(async (msg) => {
  const url = msg.text;
  if (!url || !url.startsWith('http')) return msg.reply('*_Please provide a valid SnackVideo URL_*');
  const data = await snackDownload(url);
  await msg.send({video: { url: data.download }, caption: `*${data.metadata.title}*\n\n*Uploader:* ${data.metadata.author}\n*Likes:* ${data.metadata.likes}\n*Views:* ${data.metadata.watch}`, });
});
