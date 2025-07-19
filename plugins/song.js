const { Module } = require('../lib/plugins');
const axios = require('axios');
const yts = require('yt-search');

const qualityMap = {
  '1080p': 'Full HD (1080p)',
  '720p': 'HD (720p)',
  '480p': 'SD (480p)',
  '360p': 'Low (360p)',
  '240p': 'Very Low (240p)',
  '144p': 'Tiny (144p)',
  '128kbps': 'Audio 128kbps'
};

async function getVideoInfo(url) {
  const { data } = await axios.post(`https://api.ytmp4.fit/api/video-info`, { url }, {
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://ytmp4.fit',
      'Referer': 'https://ytmp4.fit/'
    }
  });

  if (!data || !data.title) throw new Error('Gagal ambil info.');
  return data;
}

async function downloadAudioBuffer(url, q = '128kbps') {
  const res = await axios.post(`https://api.ytmp4.fit/api/download`, { url, quality: q, isAudioOnly: true }, {
    responseType: 'arraybuffer',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/octet-stream',
      'Origin': 'https://ytmp4.fit',
      'Referer': 'https://ytmp4.fit/'
    }
  });

  if (!res.headers['content-type'].includes('audio')) {
    throw new Error('Gagal download audio.');
  }

  const filename = decodeURIComponent(
    (res.headers['content-disposition'] || '').split("filename*=UTF-8''")[1] || `audio_${q}.mp3`
  ).replace(/[\/\\:*?"<>|]/g, '_');

  return {
    buffer: res.data,
    filename
  };
}

Module({
  command: 'song',
  description: 'Download song from YouTube (link or query) with optional quality',
  package: 'downloader'
})(async (message, match) => {
  if (!match && !message.quoted?.text) return message.send('Berikan link atau judul lagu.');
  // Parse args: last word might be quality, rest = query
  const parts = (match || message.quoted?.text).trim().split(/\s+/);
  let q = '128kbps'; // default
  const last = parts[parts.length - 1].toLowerCase();
  if (qualityMap[last]) {
    q = last;
    parts.pop();
  }
  let query = parts.join(' ');

  // if query is empty, reply error
  if (!query) return message.send('Berikan link atau judul lagu.');

  // If not a YouTube url, search first
  if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
    const { videos } = await yts(query);
    if (!videos.length) return message.send('Lagu tidak ditemukan.');
    query = videos[0].url;
  }

  try {
    const info = await getVideoInfo(query);
    const { buffer, filename } = await downloadAudioBuffer(query, q);

    await message.send(buffer, {
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${info.title}.mp3` || filename
    });
  } catch (e) {
    message.send('Error: ' + e.message);
  }
});
