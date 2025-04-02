const axios = require("axios");
const cheerio = require("cheerio");

async function searchAppleMusic(query) {
  try {let response = await axios.get(`https://music.apple.com/id/search?term=${query}`, {
    headers: {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}});
    let $ = cheerio.load(response.data);
    let results = [];
    $(".shelf-grid__body ul li .track-lockup").each((_, el) => {
      let titleEl = $(el).find(".track-lockup__content li").eq(0).find("a");
      let title = titleEl.text().trim();
      let albumUrl = titleEl.attr("href") || "";
      let songUrl = albumUrl ? albumUrl.replace("/album/", "/song/") + (albumUrl.match(/i=(\d+)/)?.[1] || "") : "";
      let imageUrl = $(el).find(".svelte-3e3mdo source").eq(1).attr("srcset")?.split(",")?.[1]?.trim().split(/\s+/)[0] || "";
      let artistEl = $(el).find(".track-lockup__content li").eq(1).find("a");
      let artist = {name: artistEl.text().trim(),url: artistEl.attr("href") || ""};
      if (title && songUrl) {
        results.push({ title, image: imageUrl, song: songUrl, artist });
      }
    });

    return results;
  } catch {
    return [];
  }
}

module.exports = {searchAppleMusic};
                                                    
