const { Module} = require('../lib/plugins');
const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");
const yts = require("yt-search");
const { Mp3Metadata } = require("../lib/Class/metadata"); 

async function ytGrab(u) {
  const f = new FormData();
  f.append("url", u);
  f.append("ajax", "1");
  f.append("lang", "en");

  try {
    const x = await axios.post(
      "https://genyoutube.online/mates/en/analyze/ajax?retry=undefined&platform=youtube",
      f,
      { headers: f.getHeaders() }
    );

    const $ = cheerio.load(x.data.result);
    const b = $("button").first();
    const o = b.attr("onclick");
    if (!o) throw new Error("No onclick found");

    const m = o.match(/download\((.*)\)/);
    if (!m) throw new Error("Pattern not matched");

    let j = m[1].replace(/'/g, '"');
    const a = JSON.parse(`[${j}]`);
    const d = {
      url: a[0],
      title: a[1],
      id: a[2],
      ext: a[3],
      note: a[5],
      format: a[6]
    };

    const fm = new FormData();
    fm.append("url", d.url);
    fm.append("title", d.title);
    fm.append("id", d.id);
    fm.append("ext", d.ext);
    fm.append("note", d.note);
    fm.append("format", d.format);

    const y = await axios.post(
      `https://genyoutube.online/mates/en/convert?id=${encodeURIComponent(d.id)}`,
      fm,
      { headers: fm.getHeaders() }
    );

    return {
      status: "success",
      title: d.title,
      url: y.data.downloadUrlX
    };
  } catch (e) {
    return { status: "error", message: e.message };
  }
}


Module({
  command: 'song',
  package: 'downloader',
  description: 'downloading audio'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a YouTube link or search query_');
  const m1 = await message.send('_Searching YouTube..._');
  let u = match;
  if (!match.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//)) {
    const s = await yts(match);
    if (!s || !s.videos.length) return await message.send('_No videos found._');
    u = s.videos[0].url;
  }

  const r = await ytGrab(u);
  if (r.status === "error") return await message.send(`${r.message}`, { edit: m1.key });
  await message.send(`_Downloading: ${r.title}_`, { edit: m1.key });
    const a = await axios.get(r.url, { responseType: 'arraybuffer' });
    const b = Buffer.from(a.data);
    const tagged = await Mp3Metadata(b, r.thumbnail, {
      title: r.title,
      artist: [r.author],
      album: r.title,
      year: new Date().getFullYear().toString()
    });

    await message.send({
      document: tagged,
      mimetype: 'audio/mpeg',
      fileName: `${r.title}.mp3`
    })
});

Module({
  command: 'ytmp4',
  package: 'downloader',
  description: 'download video as mp4'
})(async (message, match) => {
  if (!match || !match.includes("youtube.com") && !match.includes("youtu.be"))
  return await message.send('_Please provide a valid yt link_');
  const m1 = await message.send('_Processing..._');
  const r = await ytGrab(match);
  if (r.status === "error") return await message.send(`${r.message}`, { edit: m1.key });
  const a = await axios.get(r.url, { responseType: 'arraybuffer' });
  const v = Buffer.from(a.data);
  await message.send({video: v,mimetype: 'video/mp4',fileName: `${r.title}.mp4`,caption: `*${r.title}*` },{ quoted: message }
    );
});

      
