var fs = require('fs');
var path = require('path');
var { Command } = require('../../lib/command');

Command({
  cmd_name: 'help',
  category: 'main',
  desc: 'List all commands'
})(async (msg) => {
  const ctx = __dirname;
  const files = fs.readdirSync(ctx).filter(f => f.endsWith('.js') && f !== 'help.js');

  let list = '╭───❏ *COMMANDS*\n';
  for (const file of files) {
    const cmd = file.replace('.js', '');
    list += `│ • ${cmd}\n`;
  }

  list += '╰───❏';
  await msg.send(list);
});
