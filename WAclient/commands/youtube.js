const { Command, extractUrl, savetube} = require('../../lib/');
const {AddMetadata} = require('./Func/Mp3Data');
const ytSearch = require('yt-search');

Command({
  cmd_name: 'yts',
  category: 'search',
  desc: 'Search YouTube videos',
})(async (msg) => {
  const args = msg.text;
  if (!args) return msg.reply('Please provide a search term');
  const { videos } = await ytSearch(args);
  if (!videos.length) return;
  const results = videos.slice(0, 5).map(
    ({ title, videoId, views, timestamp: duration, ago: published, author }, i) =>
      `*${i + 1}.* ${title}\n${author.name}\n${duration}\n${views} views\n${published}\nhttps://www.youtube.com/watch?v=${videoId}`
  ).join('\n\n');

  await msg.send(`*YouTube Search:*\n\n${results}`);
});

Command({
  cmd_name: 'song',
  aliases: ['play', 'audio'],
  category: 'downloader',
  desc: 'Download songs from YouTube'
})(async (msg) => {
  if (!msg.text) return msg.reply('_Please provide a yturl or search query_');
  if (!savetube.isUrl(msg.text)) {
    const search = await savetube.search(msg.text);
    if (!search.status) return msg.reply(search.error);
    const video = search.result[0];
    if (!video) return;
    msg.text = video.url;
    } const download = await savetube.download(msg.text, 'mp3');
    if (!download.status) return msg.reply(download.error);
    const result = download.result;
    await msg.send(`*Downloading: ${result.title}...*`);
    const toAudio = await AddMetadata(
      result.download, 
      result.thumbnail,
      { title: result.title, artist: result.uploader}
    );
  
    await msg.send({ audio: toAudio, mimetype: 'audio/mpeg',fileName: `${result.title}.mp3`, contextInfo: {externalAdReply: {title: result.title, body: 'Duration: ' + result.duration,  mediaType: 2,thumbnailUrl: result.thumbnail,mediaUrl: `https://youtube.com/watch?v=${result.id}`
      }
      }                                                                                                
    })
});

Command({
  cmd_name: 'ytmp4',
  aliases: ['ytv'],
  category: 'downloader',
  desc: 'Download YouTube videos'
})(async (msg) => {
  var url = extractUrl(msg.text);
  if (!url && msg.quoted) {
  url = extractUrl(msg.quoted.message?.conversation || msg.quoted.message?.extendedTextMessage?.text || ''); }
  if (!url) return msg.reply('_Please provide a yt url_');
  if (!savetube.isUrl(url)) {
  const search = await savetube.search(url);
  if (!search.status) return msg.reply(search.error);    
  const video = search.result[0];
  if (!video) return msg.reply('_nothing_');
  url = video.url;
  } const download = await savetube.download(url, '720');
  if (!download.status) return msg.reply(download.error);
  const result = download.result;
  await msg.send({ video: { url: result.download },caption: `*Title:* ${result.title}\n*Quality:* ${result.quality}p\n*Duration:* ${result.duration}`,});  
});
