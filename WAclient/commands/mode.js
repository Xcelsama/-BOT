
const { Command } = require('../../lib/command.js');
const config = require('../../config.js');
const fs = require('fs');

const pendingModes = new Map();

Command({
    cmd_name: 'mode',
    aliases: ['worktype'],
    category: 'owner',
    desc: 'Change bot work type between public and private'
})(async (client, m, { args }) => {
    if (pendingModes.has(m.sender)) {
        const choice = m.text;
        pendingModes.delete(m.sender);
        
        const configPath = './config.js';
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        if (choice === '1') {
            configContent = configContent.replace(/WORKTYPE:.*?'.*?'/, `WORKTYPE: process.env.WORK_TYPE || 'public'`);
            fs.writeFileSync(configPath, configContent);
            return m.reply('Bot mode changed to *Public*\nRestarting...');
        } else if (choice === '2') {
            configContent = configContent.replace(/WORKTYPE:.*?'.*?'/, `WORKTYPE: process.env.WORK_TYPE || 'private'`);
            fs.writeFileSync(configContent, configContent);
            return m.reply('Bot mode changed to *Private*\nRestarting...');
        } else {
            return m.reply('Invalid choice. Mode change cancelled.');
        }
    }

    pendingModes.set(m.sender, true);
    return m.reply('*Choose bot mode:*\n\n1. Public Mode\n2. Private Mode');
});
