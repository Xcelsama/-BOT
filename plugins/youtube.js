const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");
const yts = require("yt-search");

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
  await message.send('_Searching YouTube..._');
  let videoUrl = match;
  if (!match.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//)) {
    const searchResult = await yts(match);
    if (!searchResult || !searchResult.videos.length)
      return await message.send('_No videos found for your query._');
    videoUrl = searchResult.videos[0].url;
  }

  await message.send('_Downloading audio..._');
  const result = await ytGrab(videoUrl);
  if (result.status === "error") {
    return await message.send(`Error: ${result.message}`);
  }

  try {
    const audioResp = await axios.get(result.url, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResp.data);
    await message.send({
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: `${result.title}.mp3`
    });
  } catch (e) {
    await message.send(`Failed to download or send audio: ${e.message}`);
  }
});
