const {Command} = require('../../lib/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

Command({
    cmd_name: 'install',
    category: 'owner',
    desc: 'Install plugin gist'
})(async (msg) => {
    if (!msg.fromMe) return;
    if (!msg.text) return msg.reply('Enter gist url');
    const url = msg.text.trim();
    if (!url.match(/^https:\/\/gist\.github\.com\/([a-zA-Z0-9-]+)\/([a-f0-9]+)$/)) {
    return msg.reply('invalid gist url');
    }
    const gid = url.split('/').pop();
    const res = await axios.get(`https://api.github.com/gists/${gid}`);
    const file = Object.values(res.data.files)[0];
    if (!file.filename.endsWith('.js')) {
    return msg.reply('*_must be .js file_*');
    } var code = file.content;
    if (!code.includes('Command({') || !code.includes('cmd_name:')) {
    return msg.reply('*_Invalid command format_*');
    } const fname = file.filename;
    fs.writeFileSync(path.join(__dirname, fname), code);
    msg.reply(`✓ Installed ${fname}`);
});

Command({
    cmd_name: 'cmdlist',
    category: 'owner',
    desc: 'List command files'
})(async (msg) => {
    if (!msg.fromMe) return;
    const files = fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.js'))
        .sort();

    let list = '*PLUGINS:*\n\n';
    files.forEach((f, i) => list += `${i+1}. ${f}\n`);
    msg.reply(list);
});

Command({
    cmd_name: 'del',
    category: 'owner',
    desc: 'Delete command file'
})(async (msg) => {
    if (!msg.fromMe) return;
    const num = parseInt(msg.text);
    if (!num) return msg.reply('Enter number');
    const files = fs.readdirSync(__dirname)
        .filter(f => f.endsWith('.js'))
        .sort();

    if (num < 1 || num > files.length) return msg.reply('_invalid number_');
    const file = files[num-1];
    if (file === 'plugin.js') return msg.reply('*_cannot delete plugin.js_*');
    fs.unlinkSync(path.join(__dirname, file));
    msg.reply(`✓ Deleted ${file}`);
});
