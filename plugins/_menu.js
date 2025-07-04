const { Module } = require('../lib/Module');
const { getCommands } = require('../lib/commands');
const config = require('../config');
const fs = require('fs');
const path = require('path');
const os = require('os');

Module({
    command: 'menu',
    package: 'core',
    description: 'Display available commands',
    aliases: ['h', 'help']
})(async (message) => {
    const commands = getCommands();
    const packages = commands.reduce((acc, cmd) => {
        (acc[cmd.package] = acc[cmd.package] || []).push(cmd);
        return acc;
    }, {});

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const header = `╭──╼【 *${config.theme.displayName.toUpperCase()}* 】
┃ ⛥ User: ${message.pushName}
┃ ✧ Prefix: ${config.prefix || process.env.PREFIX}
┃ ✧ Time: ${time}
┃ ✧ Mode: ${process.env.WORK_TYPE}
┃ ✧ Ram: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB
╰──────────╼\n\n`;


    const body = Object.keys(packages)
        .sort()
        .map((pkg, index, array) => {
            const ctx = packages[pkg]
                .sort((a, b) => a.command.localeCompare(b.command))
                .map(cmd => `┃ ${cmd.command}`)
                .join('\n');

            return `╭───╼【 *${pkg.toUpperCase()}* 】 \n${ctx}\n╰──────────╼`;
        })
        .join('\n');

    const txt = header + body;

    await message.send(config.theme.image || process.theme.image, 'image', txt);
});
