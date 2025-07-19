const { Module } = require('../lib/plugins');
const ytSearch = require('yt-search');
const axios = require('axios');
const FormData = require('form-data');
const cheerio = require('cheerio');

Module({
  command: 'song',
  package: 'downloader',
  description: 'Download audio from YouTube by query or URL'
})(async (message, match) => {
  if (!match) return message.send('Provide a YouTube link or search query');

  const ytRegex = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\s]+)/;
  let url = match;

  if (!ytRegex.test(match)) {
    const res = await ytSearch(match);
    const vid = res.videos?.[0];
    if (!vid) return message.send('No results found');
    url = vid.url;
  }

  async function downloadMusicAndVideos(u) {
    const f = new FormData();
    f.append("url", u);
    f.append("ajax", "1");
    f.append("lang", "en");

    try {
      const r = await axios.post(
        "https://genyoutube.online/mates/en/analyze/ajax?retry=undefined&platform=youtube",
        f,
        { headers: f.getHeaders() }
      );

      const $ = cheerio.load(r.data.result);
      const b = $("button").first();
      const c = b.attr("onclick");
      if (!c) throw new Error("No onclick");

      const m = c.match(/download\((.*)\)/);
      if (!m) throw new Error("No match");

      const j = m[1].replace(/'/g, '"');
      const a = JSON.parse(`[${j}]`);
      const d = {
        u: a[0],
        t: a[1],
        i: a[2],
        e: a[3],
        n: a[5],
        f: a[6]
      };

      const x = new FormData();
      x.append("url", d.u);
      x.append("title", d.t);
      x.append("id", d.i);
      x.append("ext", d.e);
      x.append("note", d.n);
      x.append("format", d.f);

      const y = await axios.post(
        `https://genyoutube.online/mates/en/convert?id=${encodeURIComponent(d.i)}`,
        x,
        { headers: x.getHeaders() }
      );

      return {
        status: "success",
        title: d.t,
        url: y.data.downloadUrlX
      };
    } catch (e) {
      return { status: "error", message: e.message };
    }
  }

  const r = await downloadMusicAndVideos(url);
  if (r.status !== 'success') return message.send(r.message);

  await message.send({
    audio: { url: r.url },
    mimetype: 'audio/mpeg',
    fileName: r.title + '.mp3',
    ptt: false
  })
});
