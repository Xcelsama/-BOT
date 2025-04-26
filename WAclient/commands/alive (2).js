
const { Command } = require('../../lib/command');
const { monospace } = require('../../lib/Functions');
const os = require('os');
const AliveSchema = require('../../lib/DB/schemas/AliveSchema');

Command({
    cmd_name: 'alive',
    category: 'core',
    desc: 'Check if bot is running',
})(async(msg) => {
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const sec = Math.floor(uptime % 60);
    
    let aliveData = await AliveSchema.findOne({ userId: msg.sender });
    if (!aliveData) {
        aliveData = { 
            customMessage: '*X ASTRAL ONLINE*',
            mediaType: 'none',
            mediaUrl: '',
            mentions: [],
            footer: '© X ASTRAL BOT'
        };
    }

    const currentTime = moment().format('HH:mm:ss');
    const currentDate = moment().format('DD/MM/YYYY');
    
    var voidi = `Hello: @${msg.sender.split('@')[0]}\n` +
        `${currentTime}\n` +
        `${currentDate}\n` +
        `${aliveData.customMessage}\n\n` +
        `${aliveData.footer}`;

    const mentionedJids = aliveData.mentions || [];
    
    if (aliveData.mediaType === 'none') {
        await msg.reply(voidi, { mentions: mentionedJids });
    } else {
        const mediaMessage = {
            image: aliveData.mediaType === 'image' ? { url: aliveData.mediaUrl } : undefined,
            video: aliveData.mediaType === 'video' ? { url: aliveData.mediaUrl } : undefined,
            gif: aliveData.mediaType === 'gif' ? { url: aliveData.mediaUrl } : undefined,
            caption: voidi,
            mentions: mentionedJids
        };
        
        await msg.reply(mediaMessage);
    }
});

Command({
    cmd_name: 'setalive',
    category: 'core',
    desc: 'Set custom alive message',
    usage: 'setalive @media <url>\nHello: @user\n@time\n@date\n@msg <message>\n\n@footer <footer>'
})(async(msg, args) => {
    if (!args[0]) {
        return msg.reply(`🔧 *Alive Settings Usage:*
Example:
setalive @media https://i.imgur.com/example.jpg
Hello: @user
@time
@date
@msg Bot is online!

@footer Made with ❤️ by X-Astral`);
    }

    const input = args.join(' ');
    const updateData = {};

    // Parse media URL
    const mediaMatch = input.match(/@media\s+(https?:\/\/\S+)/i);
    if (mediaMatch) {
        updateData.mediaUrl = mediaMatch[1];
    }

    // Parse message
    const msgMatch = input.match(/@msg\s+([^\n]+)/i);
    if (msgMatch) {
        updateData.customMessage = msgMatch[1];
    }

    // Parse footer
    const footerMatch = input.match(/@footer\s+([^\n]+)/i);
    if (footerMatch) {
        updateData.footer = footerMatch[1];
    }

    await AliveSchema.findOneAndUpdate(
        { userId: msg.sender },
        updateData,
        { upsert: true }
    );
    
    await msg.reply('✅ Alive settings updated successfully!');
});
