const { search, download } = require('aptoide-api');
const { Module } = require('../lib/plugins');

Module({
  command: 'apk',
  package: 'downloader',
  description: 'Search and download apps'
})(async (message, match) => {
  if (!match) return await message.send('Please provide an app name');
  const results = await search(match, 10);
  if (!results.length) return await message.send('_sorry_');
  let caption = `Reply with a number (1 to 10):\n\n`;
  results.forEach((app, i) => {
    caption += `${i + 1}. ${app.name}\n*Package:* ${app.package}\n*Rating:* ${app.rating}\n*Version:* ${app.version}\n*Size:* ${app.size}\n\n`;
  });
  
  await message.send(caption);
});

Module({
  on: 'text'
})(async (message) => {
  if (!message.quoted) return;
  if (!message.body.match(/^\d+$/)) return;
  const number = parseInt(message.body.trim());
  const q = typeof message.quoted.message === 'string' ? message.quoted.message : '';
  const lines = q.split('\n').filter(line => /^\d+\.\s/.test(line));
  const slt = lines[number - 1];
  if (!slt) return await message.send('Invalid');
  const ctx = slt.split('. ')[1];
  if (!ctx) return await message.send('sorry');
  const result = await search(ctx, 1);
  if (!result.length) return await message.send('not found');
  const app = result[0];
  await message.send(`*Downloading:* ${app.name}...`);
  const buffer = await download(app.downloadUrl);
  await message.send({ document: buffer, fileName: `${app.name}.apk`, mimetype: 'application/vnd.android.package-archive' });
});
