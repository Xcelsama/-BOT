const axios = require('axios');
const cheerio = require('cheerio');

class SongFinder {
  async main(q) {
    const url = `https://songslover.li/?s=${encodeURIComponent(q)}`;
    const html = (await axios.get(url)).data;
    const $ = cheerio.load(html);
    const article = $('article.item-list').first();
    const posturl = article.find('h2.post-box-title a').attr('href');
    const title = article.find('h2.post-box-title a').text().trim();
    const image = article.find('.post-thumbnail img').attr('src');

    const { data } = await axios.get(posturl);
    const ext = cheerio.load(data);
    const zip = ext('a:contains("Download All Files (Zip)")').attr('href');

    return { title, posturl, image, zip };
  }
}

module.exports = SongFinder;
