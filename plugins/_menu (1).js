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

    // Get system info
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
    const userName = message.pushName || 'User';
    const workType = process.env.WORK_TYPE || 'public';

    // Header from theme
    const header = `╭──╼【 *${config.theme.displayName.toUpperCase()}* 】
┃ ⛥ User: @${userName}[❤️]
┃ ✧ Prefix: [ ${config.prefix} ]
┃ ✧ Time: ${time}
┃ ✧ Mode: ${workType}
┃ ✧ Ram: ${ramUsage} MB
╰──────────╼\n\n`;

    // Body with dynamic commands
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

    const menuText = header + body;

    await message.send(menuText, 'image', config.theme.image);
});
