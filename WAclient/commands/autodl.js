/*var { extractUrl, igdl } = require('../../lib/Functions');
var { Command } = require('../../lib/command');

Command({
  
})(async (msg) => {
  const url = extractUrl(msg.body);
  if (!url || !url.includes('instagram.com')) return;
  let res;
  try { res = await igdl(url);
  } catch (e) {
  return msg.reply('yh neh');
  } if (!res || !res.links.length) return;
  for (const link of res.links) {
    if (res.type === 'video') {
      await msg.send({ video: { url: link }, caption: 'Video❤️' });
    } else {
      await msg.send({ image: { url: link }, caption: 'Photo❤️' });
    }
  }
});
      
*/
