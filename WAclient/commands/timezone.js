var {Command} = require('../../lib/command');
const moment = require('moment-timezone');
          
Command({
  cmd_name: 'time',
  category: 'misic',
  desc: 'Get current timezone'
})(async (msg) => {
  const zone = msg.text;
  if (!zone) return await msg.send('*usage:* time <Timezone>\n_Example:_ time Africa/Johhansburg');
  if (!moment.tz.zone(zone)) { return await msg.send(`*invalid timezone*\nCheck: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`); }
  const now = moment().tz(zone);
  const ctx = `╭──【*Current Time*】\n
├─*Zone:* ${zone}
├─*Date:* ${now.format('dddd, MMMM Do YYYY')}
├─*Time:* ${now.format('HH:mm:ss')}
├─*UTC Offset:* UTC${now.format('Z')}
╰─────╼
  `.trim();
  await msg.send(ctx);
});
      
