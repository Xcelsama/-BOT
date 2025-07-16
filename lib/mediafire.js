const { chromium } = require('playwright');

class Mediafire {
  constructor() {
    this.ua = 'Mozilla/5.0 (Linux; Android 6.0; iris50) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36';
  }

  async get(url) {
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext({ userAgent: this.ua });
    const page = await ctx.newPage();
    try {
      await page.goto(url);
      const info = await page.evaluate(() => {
        const name = document.querySelector('.dl-btn-label')?.textContent.trim() || '';
        const btn = document.querySelector('#downloadButton');
        const link = btn?.href || '';
        const size = btn?.textContent.match(/\(([^)]+)\)/);
        const meta = {};
        document.querySelectorAll('meta').forEach(m => {
          const n = m.getAttribute('name') || m.getAttribute('property');
          const c = m.getAttribute('content');
          if (n && c) meta[n.split(':')[1]] = c;
        });
        return { name, link, size: size ? size[1] : '', meta };
      });

      if (!info.link.startsWith('https://down')) {
        await browser.close();
        const b2 = await chromium.launch({ headless: true });
        const c2 = await b2.newContext({ userAgent: this.ua });
        const p2 = await c2.newPage();
        await p2.goto(info.link);
        const fix = await p2.evaluate(() => {
          return { link: document.querySelector('#downloadButton')?.href || '' };
        });
        info.link = fix.link;
        await b2.close();
      }

      return info;
    } catch (e) {
      return { success: false, message: e.message };
    } finally {
      await browser.close();
    }
  }
}

module.exports = Mediafire;
