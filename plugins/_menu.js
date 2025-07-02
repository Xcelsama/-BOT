const { Module } = require('../lib/Module');
const { commands } = require('../lib/commands');
const config = require('../config');

Module({
    command: 'menu',
    package: 'core',
    description: 'Show bot menu',
    aliases: ['list', 'm']
})(async (msg) => {
    const packages = {};
    commands.forEach((cmd, name) => {
        if (cmd.command === name) { 
            const pkg = cmd.package || 'general';
            if (!packages[pkg]) packages[pkg] = [];
            packages[pkg].push(cmd);
        }
    });

    let txt = `╭──╼「*${config.BOT_NAME}*」
┃⛥ *Prefix:* ${config.PREFIX || '/'}
┃⛥ *Owner:* ${config.OWNER}
╰──────────╼`;

    Object.keys(packages).forEach(pkg => {
        txt += `╭───「 *${pkg.toUpperCase()}*」\n`;
        packages[pkg].forEach(cmd => {
            txt += `┃ ${cmd.command}\n`;
        });
        txt += `╰──────────╼\\n\n`;
    });

    await msg.send(txt, 'text');
});
