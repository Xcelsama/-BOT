const g_i_s = require('g-i-s');
var { Command } = require('../../lib/command');

var searchImages = (options) =>
  new Promise((resolve, reject) => {
    g_i_s(options, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });

Command({
  cmd_name: 'img',
  aliases: ['image'],
  category: 'downloader',
  desc: 'Download images from Google'
})(async (msg) => {
  let text = msg.text;
  if (!text) return msg.reply('_Please provide a search term_');
  const results = await searchImages({
    searchTerm: text,
    queryStringAddition: '&safe=off'
  });
  if (!results || results.length === 0) return;
  for (let img of results.slice(0, 5)) {
    await msg.send({
      image: { url: img.url },
      caption: `${text}`
    });
  }
});
  
