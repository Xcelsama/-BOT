const { Module } = require('../lib/Module');
const { CallReject } = require('../lib/database');
const config = require('../config');

Module({
    command: 'callreject',
    package: 'owner',
    description: 'Toggle auto call reject',
    aliases: ['cr', 'anticall']
})(async (message, text) => {
    if (message.sender !== config.OWNER + '@s.whatsapp.net') {
        return;
    }
        let callReject = await CallReject.findOne();      
        if (!callReject) {
        callReject = new CallReject();
        }
        if (text === 'on' || text === 'enable') {
            callReject.enabled = true;
            await callReject.save();
            await message.reply('Call reject enabled');
        } else if (text === 'off' || text === 'disable') {
            callReject.enabled = false;
            await callReject.save();
            await message.reply('Call reject disabled');
        } else {
            const status = callReject.enabled ? 'Enabled' : 'Disabled';
            await message.reply(`*Call Status:* ${status}\n\nuse: ${config.PREFIX}callreject on/off`);
        }
});
          
