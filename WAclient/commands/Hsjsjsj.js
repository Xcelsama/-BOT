const { Command } = require('../../lib/command');
const {savetube} = require('../../lib/savetube');

Command({
  cmd_name: 'son',
  category: 'downloads',
  desc: 'Download songs from YouTube'
})(async (msg) => {
  if (!msg.text) return msg.reply('Please provide a YouTube URL or search query')
  try {
    if (!savetube.isUrl(msg.text)) {
      const search = await savetube.search(msg.text);
      if (!search.status) return msg.reply(search.error);
      const video = search.result[0];
      if (!video) return msg.reply('nothing');
      msg.text = video.url;
    }
    
    const download = await savetube.download(msg.text, 'mp3');
    if (!download.status) return msg.reply(download.error);
    const result = download.result;
    const caption = `*Title:* ${result.title}\n*Duration:* ${result.duration}\n*Quality:* ${result.quality}kbps`;
    
    await msg.send({ 
      audio: { url: result.download },
      mimetype: 'audio/mpeg',
      fileName: `${result.title}.mp3`
    });
    
  } catch (error) {
    console.error(error);
    return msg.reply('err');
  }
});
