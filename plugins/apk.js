const { search, download } = require('aptoide-api');
const { Module } = require('../lib/plugins');

Module({
  command: 'apk',
  package: 'downloader',
  description: 'Search and download apps'
})(async (message, match) => {
  if (!match) return await message.send('Please provide an app name');
  const results = await search(match, 9);
  if (!results.length) return await message.send('_sorry_');
  let caption = `Reply with a number (1 to 10):\n\n`;
  results.forEach((app, i) => {
  caption += `${i + 1}. ${app.name}\n*Package:* ${app.package}\n*Rating:* ${app.rating}\n*Version:* ${app.version}\n*Size:* ${app.size}\n\n`; });
  await message.send(caption);
});

Module({
  on: 'text'
})(async (message) => {
  if (!message.quoted) return;
  if (!message.body.match(/^\d+$/)) return;
  const number = parseInt(message.body.trim());
  const quoted = message.quoted;
  const voidi = typeof quoted.msg === 'string' ? quoted.msg : typeof quoted.msg?.text === 'string' ? quoted.msg.text : typeof quoted.msg?.caption === 'string' ? quoted.msg.caption : '';
  const lines = voidi.split('\n').filter(line => /^\d+\.\s/.test(line.trim()));
  const ltd = lines[number - 1];
  if (!ltd) return; const pq = ltd.split('. ')[1];
  if (!pq) return; const result = await search(pq, 1);
  if (!result.length) return;
  const app = result[0];
  const buffer = await download(app.downloadUrl);
  await message.send({document: buffer,fileName: `${app.name}.apk`, mimetype: 'application/vnd.android.package-archive'});
});
