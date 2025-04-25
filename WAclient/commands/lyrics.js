const axios = require('axios');
var {Command} = require('../../lib/command.js');

Command({
  cmd_name: 'lyrics',
  category: 'search',
  desc: 'Get lyrics by song name'
})(async (msg, text) => {
  var text = msg.text;
  if (!text) return msg.reply('Please provide a song name\nExample: lyrics Dior by Pop Smoke');
    var url = `https://www.archive-ui.biz.id/api/search/lyrics?query=${text}`;
    const { data } = await axios.get(url);
    if (!data.status || !data.result) return;
    const res = data.result;
    const caption = `*${res.title}*\n\n${res.lyrics.trim()}`;
    if (res.thumb) {
    await msg.send({ image: { url: res.thumb }, caption });
    } else {
      msg.reply(caption);
    }
});
      
