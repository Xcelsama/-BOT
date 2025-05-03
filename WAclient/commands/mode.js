const { Command } = require('../../lib/command');
const fs = require('fs');
const path = require('path');

Command({
    cmd_name: 'mode',
    aliases: ['worktype'],
    category: 'owner',
    desc: 'Switch between private and public',
    ownerOnly: true
})(async (msg) => {
    if (!msg.fromMe) return;
    var args = msg.text;
    const mode = args[0]?.toLowerCase();
    if (!mode || !['private', 'public'].includes(mode)) {
    return msg.reply('Please specify mode: private or public');
    } const c = path.join(__dirname, '../../config.js');
    let ctx = fs.readFileSync(c, 'utf8');
    ctx = ctx.replace(
    /WORKTYPE: process\.env\.WORK_TYPE \|\| '[^']*'/,
    `WORKTYPE: process.env.WORK_TYPE || '${mode}'`);
    fs.writeFileSync(c, ctx);
    process.env.WORK_TYPE = mode;
    global.config.WORKTYPE = mode;
    await msg.reply(`*Mode changed to:* ${mode}`);
});
