var {Sticker} = require('wa-sticker-formatter');
var {Command} = require('../../lib/command');

Command({
  cmd_name: 'take',
  category: 'converter',
  desc: 'Make sticker'
})(async (msg) => {
  const mime = msg.quoted?.type || msg.type;
  if (!/image|video|gif/.test(mime)) return await msg.send('Reply to an image, video, or gif\n\n*Example:* take MyPack|ByMe');
  const [pack, author] = (msg.args.join(' ') || '').split('|');
  if (!pack || !author) return await msg.send('*usage:* take Pack|Author');
  const buffer = await msg.quoted?.download() || await msg.download();
  const sticker = new Sticker(buffer, {
  pack, author, type: 'full', quality: 80,
  animated: /video|gif/.test(mime)});
  const stx = await sticker.build();
  await msg.send(stx, 'sticker');
});
   
Command({
  cmd_name: 'stk',
  category: 'converter',
  desc: 'Convert image, video, or gif to sticker'
})(async (msg) => {
  const mime = msg.quoted?.type || msg.type;
  if (!/image|video|gif/.test(mime)) return await msg.send('Reply to an image, video, or gif');
  const buffer = await msg.quoted?.download() || await msg.download();
  const sticker = new Sticker(buffer, {
  pack: '❤️ Xastarl', author: `${msg.pushName}`,type: 'full',quality: 80,animated: /video|gif/.test(mime)});
  const stx = await sticker.build();
  await msg.send(stx, 'sticker');
});
  
