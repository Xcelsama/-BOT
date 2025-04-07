var { Command } = require('../../lib/command.js');
const config = require('../../config.js');
const fs = require('fs');

Command({
    cmd_name: 'mode',
    aliases: ['worktype'],
    category: 'owner',
    desc: 'Change bot work type between public and private'
})(async (msg) => {
    const ctx = new Map();
    if(!msg.fromMe) return;
    if (ctx.has(msg.sender)) {
        const choice = msg.text;
        ctx.delete(msg.sender);
        const pk = '../../config.js';
        let voidi = fs.readFileSync(pk, 'utf8');
        if (choice === '1') {
            voidi = voidi.replace(/WORKTYPE:.*?'.*?'/, `WORKTYPE: process.env.WORK_TYPE || 'public'`);
            fs.writeFileSync(pk, voidi);
            return msg.reply('Bot mode changed to *Public*\nRestarting...');
        } else if (choice === '2') {
            pk = voidi.replace(/WORKTYPE:.*?'.*?'/, `WORKTYPE: process.env.WORK_TYPE || 'private'`);
            fs.writeFileSync(voidi, voidi);
            return msg.reply('Bot mode changed to *Private*\nRestarting...');
        } else {
            return msg.reply('_Invalid choice_');
        }
    }

    ctx.set(msg.sender, true);
    return msg.reply('*Choose bot mode:*\n\n1. Public Mode\n2. Private Mode');
});
