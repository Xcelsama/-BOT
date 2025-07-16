const Mediafire = require('../lib/mediafire');
const { Module } = require('../lib/plugins');

Module({
  command: 'mediafire',
  package: 'downloader',
  description: 'Search and download a file',
})(async (message, match) => {
  if (!match) return await message.send('Send a Mediafire link');
  const mf = new Mediafire();
  const res = await mf.get(match);
  if (!res.link) return await message.send('err');
  await message.send({document: { url: res.link },fileName: res.name,mimetype: 'application/octet-stream',caption: `*Name:* ${res.name}\n*Size:* ${res.size}`,},{ quoted: message });
});
