const { Module } = require('../lib/plugins');
const axios = require('axios');

Module({
  command: 'sketch',
  package: 'thematic',
  description: 'ai img'
})(async (message, match) => {
  if (!match) return await message.send('_Please provide a query_');
  class T2I {
    constructor() {
      this.u = "https://fluxai.pro/api/tools/fast";
      this.h = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; FluxAI-Client/1.0)",
        "Accept": "application/json"
      };
    }
    v(p) {
      return typeof p === "string" && p.trim().length > 0;
    }

    async g(p) {
      if (!this.v(p)) throw new Error("Prompt req");
      const d = { prompt: p };
      try {
        const { data: r } = await axios.post(this.u, d, { headers: this.h });
        return r;
      } catch (e) {
        console.error(e.message);
        return null;
      }
    }
  }

  const x = new T2I();
  const r = await x.g(match);
  if (!r || !r.url) return;
  await message.send({ image: { url: r.url }});
});
