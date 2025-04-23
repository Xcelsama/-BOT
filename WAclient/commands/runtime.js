var {Command} = require('../../lib/command');
var {runtime} = require('../../lib/Functions');

Command({
  cmd_name: 'runtime',
  category: 'misc',
  desc: 'Shows how long the bot has been running'
})(async (msg) => {
  const time = process.uptime();
  await msg.send(`*runtime*: ${runtime(time)}`);
});
 
