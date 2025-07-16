const axios = require("axios");
const crypto = require("crypto");

class ytdl {
  constructor() {
    this.api = {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      down: "/download",
    };
    this.headers = {
      accept: "*/*",
      "content-type": "application/json",
      origin: "https://yt.savetube.me",
      referer: "https://yt.savetube.me/",
      "user-agent": this.ua(),
    };
    this.fmts = ["144", "240", "360", "480", "720", "1080", "mp3"];
  }

  ua() {
    const list = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0",
    ];
    return list[Math.floor(Math.random() * list.length)];
  }

  getId(link) {
    const reg = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    ];
    for (let r of reg) {
      let m = link.match(r);
      if (m) return m[1];
    }
    return null;
  }

  hex(hex) {
    return Buffer.from(hex.match(/.{1,2}/g).join(""), "hex");
  }

  async dec(enc) {
    try {
      const key = this.hex("C5D58EF67A7584E4A29F6C35BBC4EB12");
      const buf = Buffer.from(enc, "base64");
      const iv = buf.slice(0, 16);
      const data = buf.slice(16);
      const dec = crypto.createDecipheriv("aes-128-cbc", key, iv);
      const out = Buffer.concat([dec.update(data), dec.final()]);
      return JSON.parse(out.toString());
    } catch (e) {
      throw new Error(e);
    }
  }

  async req(path, data = {}, method = "post") {
    try {
      const url = path.startsWith("http") ? path : this.api.base + path;
      const res = await axios({
        method,
        url,
        headers: this.headers,
        data: method === "post" ? data : undefined,
        params: method === "get" ? data : undefined,
      });
      return { status: true, code: 200, data: res.data };
    } catch (e) {
      throw new Error(e);
    }
  }

  async cdn() {
    const res = await this.req(this.api.cdn, {}, "get");
    if (!res.status) throw new Error(res);
    return { status: true, code: 200, data: res.data.cdn };
  }

  async down(link, fmt) {
    if (!link) {
      return {
        status: false,
        code: 400,
        error: "url required",
      };
    }

    if (!fmt || !this.fmts.includes(fmt)) {
      return {
        status: false,
        code: 400,
        error: "err",
        list: this.fmts,
      };
    }

    const id = this.getId(link);
    if (!id) throw new Error("link invalid");
    try {
      const c = await this.cdn();
      const info = await this.req(`https://${c.data}${this.api.info}`, {
        url: `https://www.youtube.com/watch?v=${id}`,
      });
      const dec = await this.dec(info.data.data);
      const get = await this.req(`https://${c.data}${this.api.down}`, {
        id,
        downloadType: fmt === "mp3" ? "audio" : "video",
        quality: fmt === "mp3" ? "128" : fmt,
        key: dec.key,
      });

      return {
        status: true,
        code: 200,
        result: {
          title: dec.title,
          type: fmt === "mp3" ? "audio" : "video",
          format: fmt,
          thumbnail: dec.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
          download: get.data.data.downloadUrl,
          id,
          key: dec.key,
          duration: dec.duration,
          quality: fmt === "mp3" ? "128" : fmt,
          downloaded: get.data.data.downloaded,
        },
      };
    } catch (e) {
      throw new Error(e);
    }
  }
}

module.exports = ytdl;
