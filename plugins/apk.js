const { search, download } = require('aptoide-api');
const { Module } = require('../lib/plugins');
const TextStyles = require('../lib/textfonts');


Module({
  command: 'apk',
  package: 'downloader',
  description: 'Search and download apps'
})(async (message, match) => {
  const styles = new TextStyles();
  if (!match) return await message.send('Please provide an app name');
  const results = await search(match, 9);
  if (!results.length) return await message.send('_sorry_');
  let caption = `Reply with a number (1 to 9):\n\n`;
  results.forEach((app, i) => {
    caption += `${String(i + 1).padEnd(2)}. ${app.name}\n`;
    caption += `   *Package:* ${app.package}\n`;
    caption += `   *Rating :* ${app.rating}\n`;
    caption += `   *Version:* ${app.version}\n`;
    caption += `   *Size   :* ${app.size}\n\n`; });
  const f = styles.toMonospace(caption);
  await message.send(f);
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
