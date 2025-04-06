const axios = require("axios");
const cheerio = require("cheerio");
var {Command} = require('../../lib/command');

Command({
  cmd_name: 'soundcloud',
  category: 'downloader',
  desc: 'Download from SoundCloud or search by name'
})(async (msg) => {
  const query = msg.text;
  if (!query) return msg.reply('*_Give Soundcloud link or search query_*');
  if (query.startsWith('https://')) {
    const getToken = await axios.get("https://soundcloudmp3.org/");
    const $ = cheerio.load(getToken.data);
    const token = $("input").attr("value");
    const config = {
      _token: token,
      lang: "en",
      url: query,
      submit: "",
    };
    const { data } = await axios.post("https://soundcloudmp3.org/converter", new URLSearchParams(config).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const $res = cheerio.load(data);
    const info = {};
    $res(".info > p").each((_, el) => {
      const label = $res(el).find("b").text().replace(':', '').toLowerCase();
      const value = $res(el).text().replace(label, '').trim();
      info[label] = value;
    });

    const thumb = $res(".info img").attr("src");
    const dl = $res("#ready-group a").attr("href");
    let cap = `*Title:* ${info.title || '-'}\n*Duration:* ${info.duration || '-'}\n*Bitrate:* ${info.bitrate || '-'}`;
    await msg.send({ image: { url: thumb }, caption: cap });
    await msg.send({ document: { url: dl }, mimetype: 'audio/mpeg', fileName: info.title + ".mp3" });
  } else {
    const { data } = await axios.get(`https://soundcloud.com/search?q=${query}`);
    const $ = cheerio.load(data);
    const script = $("#app > noscript").eq(1).html();
    const _$ = cheerio.load(script);
    const results = [];
    
     _$("ul > li > h2 > a").slice(0, 12).each((_, el) => {
      const href = _$ (el).attr("href");
      if (href.split("/").length === 3) {
        results.push(`• ${_$(el).text()}\nhttps://soundcloud.com${href}`);
      }
    });

    if (!results.length) return;
    await msg.reply(results.join("\n\n"));
  }
});
      
