const {Command} = require('../../lib/command');
var { getContentType } = require('baileys');

Command({
    cmd_name: 'vv',
    aliases: ['antivo', 'antiviewonce'],
    category: 'tools',
    desc: 'Convert view once media to normal media'
})(async (msg) => {
    if (!msg.quoted) return msg.reply('*Reply to a view once message*');    
    if (!msg.quoted.message?.viewOnceMessageV2?.message) {
        return msg.reply('*This is not a view once*');
    }
    const type = getContentType(msg.quoted.message.viewOnceMessageV2.message);
    const stream = await msg.quoted.download(); 
    if (!stream) return msg.reply('*oops');  
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }

    const caption = msg.quoted.message.viewOnceMessageV2.message[type]?.caption || '';
    if (type.includes('image')) {
        await msg.send({ image: buffer, caption});
    } else if (type.includes('video')) {
        await msg.send({ video: buffer, caption});
    }
});
        
