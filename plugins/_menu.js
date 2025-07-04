const { Module } = require('../lib/Module');
const { getCommands } = require('../lib/commands');
const config = require('../config');
const fs = require('fs');
const path = require('path');

Module({
    command: 'menu',
    package: 'misc',
    description: 'Display available commands',
    aliases: ['h', 'help']
})(async (message) => {
    const commands = getCommands();
    const packages = commands.reduce((acc, cmd) => {
        (acc[cmd.package] = acc[cmd.package] || []).push(cmd);
        return acc;
    }, {});

    const header = `${config.theme.messages.menu_h}`;
    const body = Object.keys(packages)
        .sort()
        .map((pkg, index, array) => {
            const ctx = packages[pkg]
                .sort((a, b) => a.command.localeCompare(b.command))
                .map(cmd => {
                    const aliases = cmd.aliases?.length ? ` | ${cmd.aliases.map(alias => config.prefix + alias).join(' | ')}` : '';
                    return `┃ ${cmd.command}${aliases}\n`;
                })
                .join('\n');

            const separator = index < array.length - 1 ? '\n╰──────────╼\n\n' : '\n';
            return `┌─ ${config.theme.emojis.package} *${pkg.toUpperCase()}* ─\n${ctx}${separator}`;
        })
        .join('');

    const footer = `\n\n${config.theme.emojis.total} ${commands.length}`;

    if (config.theme.image) {
        await message.conn.sendMessage(message.chat, {
            image: { url: config.theme.image },
            caption: header + body + footer
        });
    } else {
        await message.send(header + body + footer, 'text');
    }
});
