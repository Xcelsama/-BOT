const { Command } = require('../../lib/command');
const { exec } = require('child_process');
const config = require('../../config');

Command({
    cmd_name: 'install-npm',
    category: 'owner',
    desc: 'Install np'
})(async (msg) => {
    if(!msg.fromMe && !config.MODS) return;
    if (msg.text.length === 0) return msg.reply("Please provide the npm");
    const pk = msg.text;
    msg.reply('_Please wait...');
    exec(`npm install ${pk}`, (error, stdout, stderr) => {
        if (error || stderr) {
            return msg.reply("oops");}
        msg.reply(`Package installed: ${stdout}`);
    });
});
