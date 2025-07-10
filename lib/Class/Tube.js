const axios = require('axios');
const crypto = require('crypto');
const yts = require('yt-search');

class Tube {
  constructor() {
    this.b = 'https://media.savetube.me/api';
    this.h = {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
    };
    this.v = ['144', '240', '360', '480', '720', '1080', '1440', '2k', '3k', '4k', '5k', '8k'];
    this.a = ['mp3', 'm4a', 'webm', 'aac', 'flac', 'opus', 'ogg', 'wav'];
    this.k = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
  }

  dec(x) {
    const b = Buffer.from(x, 'base64');
    const iv = b.slice(0, 16);
    const c = b.slice(16);
    const k = Buffer.from(this.k.match(/.{1,2}/g).join(''), 'hex');
    const d = crypto.createDecipheriv('aes-128-cbc', k, iv);
    return JSON.parse(Buffer.concat([d.update(c), d.final()]).toString());
  }

  getId(u) {
    const p = [
      /watch\?v=([\w-]{11})/, /youtu\.be\/([\w-]{11})/,
      /shorts\/([\w-]{11})/, /embed\/([\w-]{11})/, /\/v\/([\w-]{11})/
    ];
    for (let r of p) if (r.test(u)) return u.match(r)[1];
    return null;
  }

  async req(p, d = {}, m = 'post') {
    const u = p.startsWith('http') ? p : this.b + p;
    const r = await axios({
      method: m,
      url: u,
      data: m === 'post' ? d : undefined,
      params: m === 'get' ? d : undefined,
      headers: this.h
    });
    return r.data;
  }

  async cdn() {
    const r = await this.req('/random-cdn', {}, 'get');
    return r?.cdn;
  }

  async dl(u, f) {
    if (!/^https?:\/\//.test(u)) return { error: 'url' };
    const all = [...this.v, ...this.a];
    if (!all.includes(f)) return { error: 'fmt' };
    const id = this.getId(u);
    if (!id) return { error: 'id' };

    const c = await this.cdn();
    const m = await this.req(`https://${c}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` });
    const j = this.dec(m.data);
    const z = await this.req(`https://${c}/download`, {
      id,
      key: j.key,
      downloadType: this.a.includes(f) ? 'audio' : 'video',
      quality: this.a.includes(f) ? '128' : f
    });

    return {
      title: j.title,
      thumb: j.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      url: z.data?.downloadUrl
    };
  }

  async find(q) {
    if (!q) return { error: 'query' };
    const r = await yts(q);
    return r.all;
  }
}

module.exports = Tube;
