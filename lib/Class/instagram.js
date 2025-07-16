const axios = require('axios');
const cheerio = require('cheerio');
const qs = require('qs');

class Instagram {
  constructor() {
    this.url = 'https://instanavigation.app/api/ajaxSearch';
    this.ua = 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0';
  }

  async get(link) {
    const data = qs.stringify({ q: link, t: 'media', lang: 'en' });
    const res = await axios.post(this.url, data, {
      headers: {
        'User-Agent': this.ua,
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'id-ID',
        'referer': 'https://instanavigation.app/',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'x-requested-with': 'XMLHttpRequest',
        'origin': 'https://instanavigation.app'
      }
    });

    const $ = cheerio.load(res.data.data);
    const thumb = $('.download-items__thumb img').attr('src') || 'not found';
    const links = [];
    $('.download-items__btn a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) links.push(href);
    });

    const files = links.map(link => {
      const ext = link.split('.').pop().split('?')[0];
      return { url: link, type: ext === 'mp4' ? 'video' : 'image' };
    });

    return { thumbnail: thumb, files };
  }
}

module.exports = Instagram;
