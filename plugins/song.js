const { Module } = require('../lib/plugins');
const fetch = require('node-fetch');

class YTMP3Downloader {
  constructor() {
    this.MAX_FETCH_ATTEMPT = 12;
    this.NEXT_FETCH_WAITING_TIME = 5000;
    this.headers = {
      "Referer": "https://ytmp3.fi/"
    };
  }

  async delay(ms) {
    return new Promise(re => setTimeout(re, ms));
  }

  async handleCapcay(id) {
    const randomCode = (Math.random() + "").substring(2, 6);

    const headers = {
      "Origin": "https://cf.hn",
      "Content-Type": "application/x-www-form-urlencoded",
      "Referer": `https://cf.hn/captcha.php?id=${id}&page=ytmp3.fi`,
    };

    const body = new URLSearchParams({
      userCaptcha: randomCode,
      generatedCaptcha: randomCode,
      id,
      page: "ytmp3.fi"
    }).toString();

    await fetch("https://cf.hn/captcha_check.php", {
      method: "POST",
      headers,
      body
    });
  }

  async download(youtubeUrl) {
    const id = youtubeUrl?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2];
    if (!id) throw Error(`Invalid YouTube URL or video ID could not be extracted.`);

    let fetchCount = 0;
    let json;

    do {
      const res = await fetch(`https://cf.hn/z.php?id=${id}&t=${Date.now()}`, {
        headers: this.headers
      });

      if (!res.ok) {
        throw Error(`fetch is not ok ${res.status} ${res.statusText}\n${await res.text() || null}`);
      }

      json = await res.json();

      if (json?.status == 0) {
        throw Error(`Error: ${json?.message || 'unknown error'}`);
      } else if (json?.status == "captcha") {
        await this.delay(5000);
        await this.handleCapcay(id);
      } else if (json?.status == 1) {
        return json;
      }

      await this.delay(this.NEXT_FETCH_WAITING_TIME);
      fetchCount++;
    } while (
      fetchCount < this.MAX_FETCH_ATTEMPT &&
      (json?.status == "captcha" || json?.status == "3" || json?.length == 0)
    );

    throw Error(`Max fetch limit exceeded or unknown error. ${json?.message || ''}`);
  }
}

Module({
  command: 'song',
  package: 'downloader',
  description: 'Search and download audio from YouTube'
})(async (message, match) => {
  if (!match) return message.send('Please provide a song name or YouTube URL.');

  const isUrl = match.startsWith('http://') || match.startsWith('https://');

  let url = match;

  if (!isUrl) {
    // Query mode: use yt-search to get first result
    const ytsearch = require('yt-search');
    const result = await ytsearch(match);
    const video = result.videos?.[0];
    if (!video) return message.send('No video found for your query.');
    url = video.url;
  }

  const ytmp3 = new YTMP3Downloader();

  try {
    const data = await ytmp3.download(url);
    await message.send(`🎵 *${data.title}*\n🔗 ${data.download}`);
    await message.send({ audio: { url: data.download }, mimetype: 'audio/mpeg' });
  } catch (e) {
    await message.send(e.message);
  }
});
