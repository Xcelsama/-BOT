const fs = require('fs');
const path = require('path');
const {Command} = require('../../lib/command');

Command({
  cmd_name: 'help',
  category: 'core',
  desc: 'List all available commands'
})(async (msg) => {
  const kf = __dirname;
  const files = fs.readdirSync(kf).filter(f => f.endsWith('.js') && f !== 'help.js');
  const cmds = [];
  for (const file of files) {
    try { const ctx = path.join(kf, file);
      const data = fs.readFileSync(ctx, 'utf8');
      const match = data.match(/cmd_name:\s*['"`](.*?)['"`]/);
      if (match) cmds.push(match[1]);
    } catch {}
  }

  if (!cmds.length) return;
  const list = [
    '╭───❏ *COMMANDS*',
    ...cmds.map(cmd => `│ • ${cmd}`),
    '╰───❏ '
  ].join('\n');

  await msg.send(list);
});
    
