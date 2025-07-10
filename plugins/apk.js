const { Module } = require('../lib/plugins');
const { search, download } = require('aptoide-api');

Module({
  command: 'apk',
  package: 'downloader',
  description: 'Search and download apps'
})(async (message, match) => {
  if (!match) return message.send('_Provide an app name_');
  const results = await search(match, 1);
  if (!results.length) return message.send('_not found_');
  const app = results[0];
  const buffer = await download(app.downloadUrl);
  const caption = `Name: ${app.name}\nSize: ${app.size}\nVersion: ${app.version}`;
  await message.send({document: buffer,fileName: `${app.name}.apk`, mimetype: 'application/vnd.android.package-archive',caption
  });
});
