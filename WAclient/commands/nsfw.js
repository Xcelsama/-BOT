const axios = require('axios');
const cheerio = require('cheerio');
var {Command} = require('../../lib/command');

Command({
  cmd_name: 'search',
  category: 'nsfw',
  desc: 'Search hentai videos'
})(async (msg) => {
  const text = msg.text;
  if (!text) return msg.reply('_provide prompt eg search stunade_');
  const res = await axios.get(`https://sfmcompile.club/?s=${text}`);
  const $ = cheerio.load(res.data);
  const hasil = [];
  $('#primary > div > div > ul > li > article').each((_, b) => {
    hasil.push({
      title: $(b).find('header > h2').text().trim() || 'No title',
      link: $(b).find('header > h2 > a').attr('href') || '',
      category:
        $(b).find('header > div.entry-before-title > span > span').text().replace('in ', '').trim() || 'Unknown',
      share_count:
        $(b).find('header > div.entry-after-title > p > span.entry-shares').text().trim() || '0',
      views_count:
        $(b).find('header > div.entry-after-title > p > span.entry-views').text().trim() || '0',
      type: $(b).find('source').attr('type') || 'image/jpeg',
      video_1:
        $(b).find('source').attr('src') || $(b).find('img').attr('data-src') || '',
      video_2: $(b).find('video > a').attr('href') || '',
    });
  });

  if (!hasil.length) return;
  const result = hasil[Math.floor(Math.random() * hasil.length)];
  await msg.send(
    result.type.includes('video')
      ? {video: { url: result.video_1 },
        caption: result.title,
        }
      : {image: { url: result.video_1 },
        caption: result.title,
        });
});
    
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
    
