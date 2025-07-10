const { Module } = require('../lib/plugins');
const Tube = require('../lib/Class/Tube'); 

Module({
  command: 'song',
  category: 'downloader',
  description: 'Search and download a song',
})(async (message, match) => {
  if (!match) return await message.send('_Please enter a song name_');
  const tube = new Tube();
  const results = await tube.find(match);
  if (!results || results.length === 0) return;
  const video = results.find(v => v.url) || results[0];
  if (!video.url) return await message.send('not valid_');
  await message.send(`\`\`\`Downloading: *${video.title}*\`\`\``);
  const dlResult = await tube.dl(video.url, 'mp3');
  if (dlResult.error || !dlResult.url) {
  return await message.send('_');
  }

  await message.send({document: { url: dlResult.url },mimetype: 'audio/mpeg', fileName: `${dlResult.title || video.title}.mp3`});
});
