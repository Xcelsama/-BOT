//
const { Module } = require('../lib/plugins');
const fetch = require('node-fetch');

const ytmp3mobi = async (youtubeUrl, format = "mp3") => {
  const regYoutubeId = /https:\/\/(www\.youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/watch\?v=)([^&|^?]+)/;
  const videoId = youtubeUrl.match(regYoutubeId)?.[2];
  if (!videoId) throw Error("Can't extract YouTube video ID. Please check your link.");

  const availableFormat = ["mp3", "mp4"];
  const formatIndex = availableFormat.findIndex(v => v == format.toLowerCase());
  if (formatIndex == -1) throw Error(`${format} is invalid. Available: ${availableFormat.join(", ")}`);

  const urlParam = {
    v: videoId,
    f: format,
    _: Math.random()
  };

  const headers = {
    "Referer": "https://id.ytmp3.mobi/",
  };

  const fetchJson = async (url, desc) => {
    const res = await fetch(url, { headers });
    if (!res.ok) throw Error(`Failed to fetch ${desc} | ${res.status} ${res.statusText}`);
    return await res.json();
  };

  const { convertURL } = await fetchJson("https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=" + Math.random(), "convertURL");

  const { progressURL, downloadURL } = await fetchJson(`${convertURL}&${new URLSearchParams(urlParam).toString()}`, "progress & download URL");

  let result = {};
  while (true) {
    const json = await fetchJson(progressURL, "progress status");
    if (json.error) throw Error(`Error while processing: ${json.error}`);
    if (json.progress == 3) {
      result = { title: json.title, downloadURL };
      break;
    }
    await new Promise(r => setTimeout(r, 3000));
  }

  return result;
};

Module({
  command: 'song',
  package: 'downloader',
  description: 'Search and download audio from YouTube'
})(async (message, match) => {
  if (!match) return message.send('Please provide a YouTube URL or query.');

  const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(match);
  let url = match;

  if (!isUrl) {
    const ytsearch = require('yt-search');
    const result = await ytsearch(match);
    const video = result.videos?.[0];
    if (!video) return message.send('No video found for your query.');
    url = video.url;
  }

  try {
    const { title, downloadURL } = await ytmp3mobi(url, 'mp3');
    await message.send(`🎵 *${title}*\n🔗 ${downloadURL}`);
    await message.send({ audio: { url: downloadURL }, mimetype: 'audio/mpeg' });
  } catch (e) {
    await message.send(`❌ ${e.message}`);
  }
});
