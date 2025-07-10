const { Module } = require('../lib/plugins');
const SongFinder = require('../lib/Class/class');

Module({
  command: 'album',
  category: 'downloader',
  description: 'Download a song pack',
})(async (message, match) => {
  if (!match) return await message.send('_Provide album name_');
  const finder = new SongFinder();
  const result = await finder.main(match);
  if (!result?.zip) return await message.send('not found');
  const caption = `*${result.title}*\n_Album_`;
  await message.send({image: { url: result.image },caption });
  await message.send({ document: { url: result.zip },mimetype: 'application/zip', fileName: `${result.title}.zip` });
});
