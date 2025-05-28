var {Command} = require('../../lib/');

Command({
  cmd_name: 'lyrics',
  category: 'music',
  desc: 'Get lyrics for a song'
})(async (msg) => {
  let args = msg.text;
    if (!args) return msg.reply('Please provide a song name or query, e.g., `.lyrics Dior by Pop Smoke`');
    const result = await msg.Genius(args);
    if (!result.ok) return;
    const { title, artist, cover, lyrics, url } = result;
    const caption = `*Title:* ${title}\n*Artist:* ${artist}\n\n${lyrics}\n`;
    await msg.send({ image: { url: cover }, caption: caption });
});
  
