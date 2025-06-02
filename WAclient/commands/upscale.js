const axios = require('axios');
var {Command} = require('../../lib/');

Command({
  cmd_name: 'upscale',
  aliases: ['enhance', 'hd'],
  category: 'tools',
  desc: 'Upscale/enhance image quality'
})(async (msg) => {    
  if (!msg.quoted) return msg.reply('_Please reply to an image_');
    if (!msg.quoted.type.includes('image')) {
    return msg.reply('_Please reply to an image_');
    }
    const imag = await msg.quoted.download();
    if (!imag) return;
    const x = imag.toString('base64');
    const db = `data:image/jpeg;base64,${x}`;
    const ctx = await axios.get('https://r-nozawa.hf.space/enhance', {
      params: {
        url: db
      },
      responseType: 'arraybuffer',
    });
    if (ctx.status === 200) {
    await msg.send({image: Buffer.from(ctx.data),caption: '*_HD_*'
      });
    }
});
