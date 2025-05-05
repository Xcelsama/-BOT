const { Command, getAllCommands } = require('../../lib/command');
const config = require('../../config');
const os = require('os');
const moment = require('moment-timezone');
const { getSystemList } = require('../../lib/systemm');
const { monospace } = require('../../lib/Functions'); 


Command({
    cmd_name: 'help',
    aliases: ['list'],
    category: 'core',
    desc: 'Display command list'
})(async (msg) => {
    const commands = getAllCommands();
    const type = {};
    
    commands.forEach(cmd => {
        if (!type[cmd.category]) type[cmd.category] = [];
        type[cmd.category].push(cmd);
    });

    let ctx = `╭─「 *whatsapp-bot* 」\n`;
    Object.entries(type).forEach(([category, cmds]) => {
        cmds.forEach(cmd => {
        ctx += `┃ ${monospace(cmd.cmd_name)}\n`;
        });
    });
    ctx += `╰──────────╼\n`;

    await msg.reply(ctx);
});

Command({
    cmd_name: 'menu',
    category: 'core',
    desc: 'Display command list'
})(async (msg) => {
    const commands = getAllCommands();
    const type = {};   
    commands.forEach(cmd => {
        if (!type[cmd.category]) type[cmd.category] = [];
        type[cmd.category].push(cmd);
    });

    const ss = getSystemList();
    const time = moment().tz('Africa/Johannesburg').format('HH:mm:ss');
    const date = moment().tz('Africa/Johannesburg').format('YYYY-MM-DD');
    const ramUsage = (os.totalmem() - os.freemem()) / (1024 * 1024);
    let menu = ss.header
        .replace('{botName}', monospace(config.BOT_NAME)) 
        .replace('{user}', monospace(msg.pushName))
        .replace('{prefix}', monospace(config.PREFIX.source.replace(/[\^$]/g, '')))
        .replace('{time}', time)
        .replace('{mode}', config.WORKTYPE)
        .replace('{ram}', ramUsage.toFixed(2));


    Object.entries(type)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([category, cmds]) => {
            menu += `╭───╼【 *${monospace(category.toUpperCase())}* 】 \n`;
            cmds.sort((a, b) => a.cmd_name.localeCompare(b.cmd_name))
                .forEach(cmd => {
                    menu += `┃ ${monospace(cmd.cmd_name)}\n`;
                });
            
            menu += `╰──────────╼\n`;
        });

    menu += `\n${config.FOOTER}`;
    await msg.reply(menu);
});
