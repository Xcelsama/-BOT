var { Command } = require('../../lib/command');
var config = require('../../config');

Command({
    cmd_name: 'setsudo',
    category: 'owner',
    desc: 'Add a number to MODS (Reply or provide number)'
})(async (msg, conn) => {
    if (!msg.fromMe && msg.sender.split('@')[0] !== config.OWNER_NUM) return;
    let number;  if (msg.quoted) {
    number = msg.quoted.sender.split('@')[0];
    } else { number = msg.text.replace(/[^0-9]/g, ''); }
    if (!number) return msg.reply('Please provide a number or reply to a user\nExample: .setsud 27686881509');
    if (config.MODS.includes(number)) return msg.reply('_This number is already a MOD_');
     const fs = require('fs');
     const path = require('path');
     const alva = path.join(__dirname, '../../config.js');
     let food = fs.readFileSync(alva, 'utf8');
     const already = config.MODS.join(',');
     const go = already + ',' + number;
     food = food.replace( /MODS: \(process\.env\.MODS \|\| '[^']*'\)\.split\(','\)/, 
    `MODS: (process.env.MODS || '${go}').split(',')` );
     fs.writeFileSync(alva, food);
     config.MODS.push(number);
     if (msg.quoted) { await msg.reply(`_Marete added @${number} to MODS_`, { mentions: [`${number}@s.whatsapp.net`] });
     } else { await msg.reply(`_Marete added ${number} to MODS_`);
    }
    
});

Command({
    cmd_name: 'getsudo',
    category: 'owner',
    desc: 'Get list of MODS'
})(async (msg, conn) => {
    if (!msg.fromMe && msg.sender.split('@')[0] !== config.OWNER_NUM) return;
    const mods = config.MODS.filter(mod => mod); // Remove empty entries
    if (mods.length === 0) return msg.reply('*No MODS found*');
    const modsText = mods.map(mod => `@${mod}`).join('\n');
    await msg.reply(`*MODS LIST:*\n\n${modsText}`, {
        mentions: mods.map(mod => `${mod}@s.whatsapp.net`)
    });
});

Command({
    cmd_name: 'removesudo',
    category: 'owner',
    desc: 'Remove a number from MODS'
})(async (msg, conn) => {
    if (!msg.fromMe && msg.sender.split('@')[0] !== config.OWNER_NUM) return;
    let number; if (msg.quoted) {
    number = msg.quoted.sender.split('@')[0];
    } else { number = msg.text.replace(/[^0-9]/g, ''); }
    if (!number) return msg.reply('Please provide a number or reply to a message');
    if (!config.MODS.includes(number)) return msg.reply('_This number is not a MOD_');
    const fs = require('fs');
    const path = require('path');
    const alva = path.join(__dirname, '../../config.js');
    let van_dam = fs.readFileSync(alva, 'utf8');
    const wow = config.MODS.filter(mod => mod !== number).join(',');
    van_dam = van_dam.replace(/MODS: \(process\.env\.MODS \|\| '[^']*'\)\.split\(','\)/,
    `MODS: (process.env.MODS || '${wow}').split(',')` );
    fs.writeFileSync(alva, van_dam);
    config.MODS = config.MODS.filter(mod => mod !== number);
    if (msg.quoted) { await msg.reply(`_Removed @${number} from MODS_`, { mentions: [`${number}@s.whatsapp.net`] });
    } else { await msg.reply(`_Removed ${number} from MODS_`);
  }
});
