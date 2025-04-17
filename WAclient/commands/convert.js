const {Command} = require('../../lib/command');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

Command({
    cmd_name: 'convert',
    aliases: ['conv', 'tomp3', 'tomp4', 'togif'],
    category: 'tools',
    desc: 'Convert media files between formats'
})(async (msg, args) => {
    if (!msg.quoted) return msg.reply('*Reply to a media msg*');
    const type = args[0]?.toLowerCase() || 'mp3';
    const stream = await msg.quoted.download();
    if (!stream) return;
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    
    const ctx = path.join(__dirname, '../../lib/temp', `input_${Date.now()}`);
    const kf = path.join(__dirname, '../../lib/temp', `output_${Date.now()}`);
    fs.writeFileSync(ctx, buffer);
    try {
        await new Promise((resolve, reject) => {
            const conv = ffmpeg(kf);
            switch(type) {
                case 'mp3':
                    conv.toFormat('mp3')
                        .on('end', resolve)
                        .on('error', reject)
                        .save(kf + '.mp3');
                    break;
                    
                case 'mp4':
                    conv.toFormat('mp4')
                        .on('end', resolve)
                        .on('error', reject)
                        .save(kf + '.mp4');
                    break;
                    
                case 'gif':
                    conv.toFormat('gif')
                        .on('end', resolve)
                        .on('error', reject)
                        .save(kf + '.gif');
                    break;
                    
                default:
                    return msg.reply('*formats: mp3, mp4, gif*');
            }
        });
        
        var dn = fs.readFileSync(kf + '.' + type);
        switch(type) {
            case 'mp3':
                await msg.send({ audio: dn, mimetype: 'audio/mp3' });
                break;
            case 'mp4':
                await msg.send({ video: dn });
                break;
            case 'gif':
                await msg.send({ video: dn, gifPlayback: true });
                break;
        }
        
    } catch (error) {
        await msg.reply(error.message);
    } finally {
        if (fs.existsSync(ctx)) fs.unlinkSync(ctx);
        if (fs.existsSync(kf + '.' + type)) fs.unlinkSync(kf + '.' + type);
    }
});
