//
const axios = require("axios");
const crypto = require("crypto");
const yts = require("yt-search");
const { Module } = require('../lib/plugins');

class Downloader {
  constructor() {
    this.metadata_api_url = "https://socialdldr.com/api/download-video";
    this.base_download_url = "https://socialdldr.com";
    this.base_url_for_spoofing = "https://socialdldr.com";
    this.axios_instance = axios.create();
    this.default_headers = {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7,as;q=0.6",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      Dnt: "1",
      "Sec-Ch-Ua": `"Not-A.Brand";v="99", "Chromium";v="124"`,
      "Sec-Ch-Ua-Mobile": "?1",
      "Sec-Ch-Ua-Platform": `"Android"`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin"
    };

    this.axios_instance.interceptors.request.use(config => {
      const spoofed_headers = this.build_headers(config.headers);
      config.headers = {
        ...this.default_headers,
        ...config.headers,
        ...spoofed_headers
      };
      return config;
    });
  }

  to_slug(s = "") {
    return String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
  }

  screen_dims() {
    const w = Math.floor(Math.random() * (1920 - 800 + 1)) + 800;
    const h = Math.floor(Math.random() * (1080 - 600 + 1)) + 600;
    return `${w}x${h}`;
  }

  get_fp() {
    const tzs = ["Asia/Jakarta", "America/New_York", "Europe/London", "Asia/Makassar"];
    const langs = ["en-US", "id-ID", "en-GB", "es-ES"];
    const plats = ["Win32", "Linux x86_64", "MacIntel", "Android"];
    const uas = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/604.1",
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Mobile Safari/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
    ];
    const rand = arr => arr[Math.floor(Math.random() * arr.length)];
    return {
      canvas: "gen_canvas_fp_" + Math.random().toString(36).substring(2, 15),
      screen: this.screen_dims(),
      timezone: rand(tzs),
      language: rand(langs),
      platform: rand(plats),
      user_agent: rand(uas),
      timestamp: Date.now()
    };
  }

  random_crypto_ip() {
    return Array.from(crypto.randomBytes(4)).map(b => b % 256).join(".");
  }

  random_id(length = 16) {
    return crypto.randomBytes(length).toString("hex");
  }

  build_headers(extra = {}) {
    const ip = this.random_crypto_ip();
    return {
      origin: this.base_url_for_spoofing,
      referer: `${this.base_url_for_spoofing}/en/xiaohongshu-videos-and-photos-downloader`,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "x-forwarded-for": ip,
      "x-real-ip": ip,
      "x-request-id": this.random_id(8),
      "X-Requested-With": "XMLHttpRequest",
      ...extra
    };
  }

  async get_meta(url = "", consent = false) {
    const fp = this.get_fp();
    const body = {
      tweet_url: url,
      browser_fingerprint: fp,
      user_consent: consent
    };
    const res = await this.axios_instance.post(this.metadata_api_url, body);
    return res.data;
  }

  async download({ url = "", quality = "480p", consent = false } = {}) {
    const meta = await this.get_meta(url, consent);
    if (!meta || !meta.formats || meta.formats.length === 0) throw new Error("No formats found.");
    const formats = meta.formats.map(f => ({
      ...f,
      url: f.url.startsWith("/") ? `${this.base_download_url}${f.url}` : f.url
    }));
    const v_formats = formats.filter(f => !f.is_audio_only);
    const slug = this.to_slug(quality);
    let selected = v_formats.find(f => this.to_slug(f.resolution) === slug)
      || v_formats.find(f => this.to_slug(f.label).includes(slug))
      || v_formats.sort((a, b) => parseInt(b.resolution) - parseInt(a.resolution))[0];
    if (!selected) throw new Error("No suitable format found.");
    return selected.url;
  }
}

Module({
  command: 'song',
  package: 'downloader',
  description: 'Search and download audio from YouTube'
})(async (message, match) => {
  if (!match) return message.send('Please provide a song name or YouTube URL.');

  let input = match.trim();
  if (!input.startsWith('http')) {
    const search = await yts(input);
    if (!search || !search.videos || !search.videos.length) {
      return message.send('No results found.');
    }
    input = search.videos[0].url;
  }

  const downloader = new Downloader();
  try {
    const url = await downloader.download({
      url: input,
      quality: '480p',
      consent: true
    });
    await message.send({ audio: { url }, mimetype: 'audio/mpeg' }, { quoted: message });
  } catch (err) {
    await message.send(err.message);
  }
});
