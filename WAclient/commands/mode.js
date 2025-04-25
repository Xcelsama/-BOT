const fs = require('fs');
const path = require('path');
const { Command } = require('../../lib/command.js');
const config = require('../../config.js');

Command({
  cmd_name: 'mode',
  aliases: ['worktype'],
  category: 'owner',
  desc: 'Change bot work type between public and private',
  fromMe: true
})(async (msg) => {
  if (!msg.fromMe) return;
  var text = msg.text;
  if (!text || !['public', 'private'].includes(text.toLowerCase())) return msg.reply('Type "mode public" or "mode private"');
  let mode = text.toLowerCase();
  let code = fs.readFileSync(config, 'utf8');
  let updated = code.replace(/WORK_TYPE\s*:\s*process\.env\.WORK_TYPE\s*\|\|\s*['"`](.*?)['"`]/, `WORK_TYPE: '${mode}'`);
  fs.writeFileSync(config, updated, 'utf8');
  msg.reply(`Work mode set to: *${mode}*`);
});
