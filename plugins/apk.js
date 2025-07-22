const { Module } = require('../lib/plugins');
const { search, download } = require('aptoide-api');

Module({ command: 'apk', package: 'downloader' })(async (message, match) => {
  if (!match) return message.send('provide an app name');
  const result = await search(match, 1);
  const app = result[0];
  if (!app) return message.send('not found');
  const apk = await download(app.downloadUrl);
  if (!apk) return message.send('err');
  return message.send({document: apk, mimetype: 'application/vnd.android.package-archive', fileName: app.name + '.apk',
  caption: `*${app.name}*\n${app.version} • ${app.size}\n${app.downloads.toLocaleString()}`,
  contextInfo: { externalAdReply: { title: app.name, body: `${app.version} • ${app.size}`, mediaType: 1, thumbnailUrl: app.icon, renderLargerThumbnail: false } }
  }, { quoted: message });
});
