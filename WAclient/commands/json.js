var {Command} = require('../../lib/command');

Command({
  cmd_name: 'json',
  category: 'tools',
  desc: 'View raw JSON of a message'
})(async (msg) => {
  await msg.send('```json\n' + JSON.stringify(msg, null, 2).slice(0, 4000) + '\n```');
});
