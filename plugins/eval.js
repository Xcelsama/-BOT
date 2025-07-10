const util = require('util');
const {Module} = require('../lib/plugins'(;
const config = require('../config');

Module({
    command: 'e',
    package: 'owner',
    description: 'eval code'
})(async (message) => {
    if (!message.fromMe && !config.mods.includes(message.sender)) return;
    if (!message.body.startsWith('e>')) return;
    const code = message.body.slice(2).trim();
    if (!code) return;
    try { const result = await (async () => eval(code))();
        const output = typeof result === 'string' ? result : util.inspect(result);
        await message.send(output);
    } catch (err) {
        await message.send(err.message);
    }
});
