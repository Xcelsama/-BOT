const { Module, commands } = require('../lib/plugins');
const { getTheme } = require('../Themes/themes');
const config = require('../config');

Module({
  command: 'menu',
  package: 'general',
  description: 'Show all commands',
})(async (message) => {
  const theme = getTheme();
  const start = '⛥';
  const time = new Date().toLocaleTimeString('en-ZA', { timeZone: 'Africa/Johannesburg' });
  const mode = config.WORK_TYPE || process.env.WORK_TYPE;
  const ramUsedMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
  let _cmd_st = `╭──╼「 *${theme.botName}* 」\n`;
  _cmd_st += `┃ ${star} User: ${user}\n`;
  _cmd_st += `┃ ${star} Prefix: ${config.prefix}\n`;
  _cmd_st += `┃ ${star} Time: ${time}\n`;
  _cmd_st += `┃ ${star} Mode: ${mode}\n`;
  _cmd_st += `┃ ${star} Ram: ${ramUsedMB} MB\n`;
  _cmd_st += `╰──────────╼\n\n`;

  const grouped = commands.reduce((acc, cmd) => {
    if (!acc[cmd.package]) acc[cmd.package] = [];
    acc[cmd.package].push(cmd.command);
    return acc;
  }, {});

  const categories = Object.keys(grouped).sort();

  for (const cat of categories) {
    _cmd_st += `╭───╼「 *${cat.toUpperCase()}* 」 \n`;
    grouped[cat]
      .sort((a, b) => a.localeCompare(b))
      .forEach(cmd => {
        _cmd_st += `┃ ${cmd}\n`;
      });
    _cmd_st += `╰──────────╼\n`;
  }

  _cmd_st += `\n${theme.other?.footer}`;

  if (theme.image) {
    await message.send(
      { image: { url: theme.image }, caption: _cmd_st },
      { quoted: message }
    );
  }
});
