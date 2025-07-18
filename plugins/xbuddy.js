'use strict';

const fs = require('fs'); const fetch = require('node-fetch');

const xbuddy = { headers: { "accept": "application/json, text/plain, /", "accept-encoding": "gzip, deflate, br, zstd", "content-type": "application/json; charset=UTF-8", "origin": "https://9xbuddy.site", "referer": "https://9xbuddy.site/", "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36", "x-requested-domain": "9xbuddy.site", "x-requested-with": "xmlhttprequest", "x-auth-token": "ad3Dq5mXrZLUzqvJx5JtaGRoycKVnMWYZmpnlZXKmJSUfqF/ZIG5r6bQtIWHhY3DrqaLqcF6hJJ/g7nAd7SvhHaSiKmtsZa9sYavlaaYydphl5SpqpejkZKWZZWQZmhkX2WTlg==" },

getToken: async function () { console.time("get token"); const headers = { ...xbuddy.headers, "x-access-token": "false", }; const res = await fetch("https://ab.9xbud.com/token", { headers, method: "POST" }); const json = await res.json(); console.timeEnd("get token"); return json; },

getHeaders: async function () { if (!xbuddy.headers["x-access-token"]) { const { access_token } = await xbuddy.getToken(); xbuddy.headers["x-access-token"] = access_token; } return xbuddy.headers; },

validateString: function (string, inputName) { if (typeof string !== "string" || !string.trim()) throw Error(invalid input ${inputName}); },

extract: async function (yourUrl, searchEngine = "yt") { console.time("extract"); xbuddy.validateString(yourUrl, "input url di fungsi extract");

const createSigAndUrlEncoded = function (url) {
  function ord(str) {
    const code = str.charCodeAt(0);
    return (code >= 0xD800 && code <= 0xDBFF) ?
      (code - 0xD800) * 0x400 + (str.charCodeAt(1) - 0xDC00) + 0x10000 :
      code;
  }
  function encode64(str) {
    return Buffer.from(str, "binary").toString("base64");
  }
  function encrypt(input, key) {
    return encode64(input.split('').map((ch, i) => String.fromCharCode(ord(ch) + ord(key[(i % key.length - 1 + key.length) % key.length]))).join(''));
  }
  const encodedUrl = encodeURIComponent(url);
  const key = xbuddy.headers["x-auth-token"] + "jv7g2_DAMNN_DUDE";
  return { url: encodedUrl, _sig: encrypt(encodedUrl, key) };
};

const fixExtractJson = function (res) {
  const token = res.response.token;
  function decrypt(hexUrl, token) {
    const cssVer = "0ae41371bd7ead4356ae";
    const hostnameLen = 12;
    const hex2bin = hex => Buffer.from(hex, 'hex').toString();
    const decode64 = b64 => Buffer.from(b64, 'base64').toString();
    const ord = char => char.codePointAt(0);
    const decrypt = (data, key) => decode64(data).split('').map((s, i) => String.fromCharCode(ord(s) - ord(key[(i % key.length - 1 + key.length) % key.length]))).join('');
    const rev = hex2bin(hexUrl).split("").reverse().join("");
    const baseKey = [..."STREAM_YRROS"].reverse().join("");
    const finalKey = `${baseKey}${hostnameLen}${cssVer}${token}`;
    return decrypt(rev, finalKey);
  }
  res.response.formats.forEach(f => f.url = decrypt(f.url, token));
  return res;
};

const headers = await xbuddy.getHeaders();
const { url, _sig } = createSigAndUrlEncoded(yourUrl);
const res = await fetch("https://ab.9xbud.com/extract", { headers, method: "POST", body: JSON.stringify({ url, _sig, searchEngine }) });
const json = await res.json();
const result = fixExtractJson(json);
console.timeEnd("extract");
return result;

},

getSupportedFormat: async function (url, format = "720p") { xbuddy.validateString(url, "youtubeUrl di fungsi getSupportedFormat"); const all = ["144p", "240p", "360p", "480p", "720p", "1080p"]; if (!all.includes(format)) throw Error(invalid format. pick one: ${all.join(", ")}); const data = await xbuddy.extract(url); const available = data.response.formats.filter(v => all.includes(v.quality)); let chosen; for (let i = all.indexOf(format); i >= 0; i--) { chosen = available.find(v => v.quality === all[i]); if (chosen) break; } return chosen; },

convert: async function (formatObj) { console.time("convert"); const [uid, url] = formatObj.url.split("/").slice(2, 4); const headers = await xbuddy.getHeaders(); const res = await fetch("https://ab1.9xbud.com/convert", { headers, method: "POST", body: JSON.stringify({ uid, url }) }); const json = await res.json(); console.timeEnd("convert"); return json; },

progress: async function (formatObj) { console.time("progress"); const headers = await xbuddy.getHeaders(); const uid = formatObj.url.split("/")[2]; const res = await fetch("https://ab1.9xbud.com/progress", { headers, method: "POST", body: JSON.stringify({ uid }) }); const json = await res.json(); console.timeEnd("progress"); return json; },

downloaderAnti403Cuy: async function (progress) { console.log("🐈 mulai download, sabar ya, tunggu aja, miau..."); console.time("download"); const headers = await xbuddy.getHeaders(); const res = await fetch(progress.response.url, { headers }); const buf = Buffer.from(await res.arrayBuffer()); console.timeEnd("download"); return buf; },

downloadVideo: async function (url, resolution) { xbuddy.validateString(url, "youtube url di function downloadVideo"); const formatObj = await xbuddy.getSupportedFormat(url, resolution); const convertObj = await xbuddy.convert(formatObj);

let progressObj, tries = 0;
const maxTries = 100;
do {
  if (++tries > maxTries) throw Error(`limit api hit reached: ${maxTries}`);
  progressObj = await xbuddy.progress(formatObj);
  console.log(`🐈 cek progres #${tries}`);
  if (progressObj?.status === 0) throw Error(`failed download: ${JSON.stringify(progressObj, null, 2)}`);
  if (!progressObj?.response) await new Promise(r => setTimeout(r, 5000));
} while (!progressObj.response);

return await xbuddy.downloaderAnti403Cuy(progressObj);

} };

// usage xbuddy.downloadVideo("https://www.youtube.com/watch?v=agi-FWTLMh0", "360p") .then(buffer => { const path = ./${Date.now()}.mp4; fs.writeFileSync(path, buffer); console.log(sukses! file ada di ${path}); }) .catch(error => console.error(error.message));

module.exports = xbuddy;

