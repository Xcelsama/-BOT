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
    const videoItems = $(".download-item").filter((i, el) => {
      return $(el).find(".type").text().trim().toLowerCase() === "video";
    });

    if (videoItems.length > 0) {
      videoItems.find(".btn-download").each((i, el) => {
        const fileUrl = $(el).attr("href");
        if (fileUrl) files.push({ type: 'mp4', url: fileUrl });
      });
    } else {
      const photoLink = $(".profile-info .btn-download").attr("href");
      if (photoLink) {
        files.push({ type: 'jpg', url: photoLink });
      } else {
        throw 'err';
      }
    }

    return { files };
  }
}

module.exports = Instagram;
