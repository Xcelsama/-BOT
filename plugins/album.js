const { Module } = require('../lib/plugins');
const SongFinder = require('../lib/Class/class');

Module({
  command: 'album',
  package: 'downloader',
  description: 'Download a song pack',
})(async (message, match) => {
  if (!match) return await message.send('_Provide album name_');
  const finder = new SongFinder();
  const result = await finder.main(match);
  if (!result?.zip) return await message.send('not found');
  const caption = `*Downloading: ${result.title} album*`;
  await message.send(caption );
  await message.send({ document: { url: result.zip },mimetype: 'application/zip', fileName: `${result.title}.zip` });
});
