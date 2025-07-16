const axios = require("axios");
const { Blob, FormData } = require("formdata-node");
const crypto = require("crypto");

class Gemini {
  constructor() {
    this.chatUrl = "https://gemini-ultra-iota.vercel.app/api/chat";
    this.uploadUrl = "https://gemini-ultra-iota.vercel.app/api/google/upload/v1beta/files?uploadType=multipart";
    this.headers = {
      accept: "*/*",
      "content-type": "text/plain;charset=UTF-8",
      origin: "https://gemini-ultra-iota.vercel.app",
      referer: "https://gemini-ultra-iota.vercel.app/",
      "user-agent": "Mozilla/5.0"
    };
  }

  token() {
  return Buffer.from(crypto.randomBytes(32).toString("hex") + "@" + Date.now()).toString("base64");
  }

  async upload(url, name = "img.jpg") {
    try { const r = await axios.get(url, { responseType: "arraybuffer" });
      const type = r.headers["content-type"] || "image/jpeg";
      const f = new FormData();
      f.append("file", new Blob([JSON.stringify({ file: { mimeType: type, displayName: name } })], { type: "application/json" }), "meta.json");
      f.append("file", new Blob([r.data], { type }), name);
      const u = await axios.post(this.uploadUrl, f, {
        headers: { ...this.headers, ...f.headers }
      });
      if (!u.data?.file?.uri) throw new Error("fail");
      return { uri: u.data.file.uri, type };
    } catch (e) {
      console.log(e.message);
      return {};
    }
  }

  async chat(opt = {}) {
    const {
      prompt = "",
      img = "",
      msg = [],
      model = "gemini-1.5-flash-latest",
      topk = 64,
      topp = 0.95,
      temp = 1,
      max = 8192,
      key = "",
      safe = "none"
    } = opt;
    try {
      const t = key || this.token();
      console.log(t);
      const parts = [];
      if (img) {
      const { uri, type } = await this.upload(img);
      if (!uri) throw new Error("fail");
      parts.push({ fileData: { mimeType: type, fileUri: uri } });
      }
      parts.push({ text: prompt });
      const data = {
        messages: msg.length ? msg : [{ role: "user", parts }],
        model,
        generationConfig: {
          topP: topp,
          topK: topk,
          temperature: temp,
          maxOutputTokens: max
        },
        safety: safe
      };
      const res = await axios.post(`${this.chatUrl}?token=${t}`, JSON.stringify(data), {
      headers: this.headers
      });
      if (!res.data) throw new Error("no reply");
      return res.data;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }
}

module.exports = Gemini;
