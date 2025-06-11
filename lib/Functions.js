const fs = require('fs');
const axios  = require('axios');
const cheerio = require('cheerio');

const igdl = async (u) => {
  let { data } = await axios.get(`https://snapdownloader.com/tools/instagram-downloader/download?url=${u}`);
  let $ = cheerio.load(data);
  const result = {
    type: null,
    links: [],
  };

  const vi = $(".download-item").filter((i, el) => {
  return $(el).find(".type").text().trim().toLowerCase() === "video";
  }); if (vi.length > 0) {
    result.type = "video";
    vi.find(".btn-download").each((i, el) => {
      const url = $(el).attr("href");
      result.links.push(url);
    });
  } else {
    const ph = $(".profile-info .btn-download").attr("href");
    if (ph) { result.type = "photo";
    result.links.push(ph);
    } else {
      throw new Error("err");
    }
  }
  return results;
};

function extractUrl(text) {
    if (!text || typeof text !== 'string') return null;
    const ur = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(ur);
    return matches ? matches[0] : null;
}

function isUrl(str) {
  const pattern = /https?:\/\/[^\s]+/;
  return pattern.test(str);
}

function parseMention(text = '') {
  return [...text.matchAll(/@(\d{5,16})/g)].map(v => v[1] + '@s.whatsapp.net');
}
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function getName(jid, conn) {
  return conn?.contacts?.[jid]?.name || conn?.contacts?.[jid]?.notify || jid;
}
function parseJid(jid) {
  if (!jid) return null;
  return jid.includes('@s.whatsapp.net') || jid.includes('@g.us')
    ? jid.split('@')[0]
    : jid;
}
    
function monospace(input) {
    const boldz = {
        'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶',
        'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽',
        'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄',
        'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
        '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔',
        '7': '𝟕', '8': '𝟖', '9': '𝟗',
        ' ': ' ' 
    };

    return input.split('').map(char => boldz[char] || char).join('');
}

function runtime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor(seconds % (3600 * 24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

module.exports = { monospace, extractUrl, runtime, parseMention,parseJid, getName,formatBytes, igdl };
