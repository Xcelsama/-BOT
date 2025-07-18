const axios = require("axios");
const cheerio = require("cheerio");

class Instagram {
  constructor() {
    this.baseUrl = 'https://snapdownloader.com/tools/instagram-downloader/download';
  }

  async get(url) {
    const { data } = await axios.get(`${this.baseUrl}?url=${url}`);
    const $ = cheerio.load(data);
    const files = [];
    const g = $(".download-item").filter((i, el) => {
      return $(el).find(".type").text().trim().toLowerCase() === "video";
    });

    if (g.length > 0) {
      g.find(".btn-download").each((i, el) => {
        const fl = $(el).attr("href");
        if (fl) files.push({ type: 'mp4', url: fl });
      });
    } else {
      const p = $(".profile-info .btn-download").attr("href");
      if (p) {
        files.push({ type: 'jpg', url: p });
      } else {
        throw 'err';
      }
    }

    return { files };
  }
}

module.exports = Instagram;
