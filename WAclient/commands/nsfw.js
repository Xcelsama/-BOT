const axios = require('axios');
const cheerio = require('cheerio');
var {Command} = require('../../lib/command');

Command({
  cmd_name: 'hentai',
  category: 'nsfw',
  desc: 'Random SFM Hentai video'
})(async (msg) => {
  const page = Math.floor(Math.random() * 1153);
  const res = await axios.get('https://sfmcompile.club/page/' + page);
  const $ = cheerio.load(res.data);
  const results = [];
  $('#primary > div > div > ul > li > article').each((_, b) => {
    results.push({
      title: $(b).find('header > h2').text(),
      link: $(b).find('header > h2 > a').attr('href'),
      category: $(b)
        .find('header > div.entry-before-title > span > span')
        .text()
        .replace('in ', ''),
      share_count: $(b)
        .find('header > div.entry-after-title > p > span.entry-shares')
        .text(),
      views_count: $(b)
        .find('header > div.entry-after-title > p > span.entry-views')
        .text(),
      type: $(b).find('source').attr('type') || 'image/jpeg',
      video_1:
        $(b).find('source').attr('src') || $(b).find('img').attr('data-src'),
      video_2: $(b).find('video > a').attr('href') || '',
    });
  });
  if (!results.length) return;
  const x = results[Math.floor(Math.random() * results.length)];
  const caption =
    `*Title* : ${x.title}\n` +
    `*Views* : ${x.views_count}\n` +
    `*Shares* : ${x.share_count}\n` +
    `*Source* : ${x.link}`;

  await msg.send({video: { url: x.video_1 },caption});
});
    
