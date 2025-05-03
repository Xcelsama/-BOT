var { Command } = require('../../lib/command');
const Reaction = require('../../lib/DB/schemas/status');

Command({
  cmd_name: 'status',
  category: 'owner',
  desc: 'Turn status reaction',
})(async (msg) => {
  if (!msg.fromMe) return;
  const arg = msg.text.toLowerCase();
  const id = msg.user;
  if (!['on', 'off'].includes(arg)) {
  return msg.reply('use:\n> statu on\n> status off');
  } const data = await Reaction.findOne({ id }) || new Reaction({ id });
  data.on = arg === 'on';
  await data.save();
  msg.reply(`auto status turned: *${arg}*.`);
});
    
