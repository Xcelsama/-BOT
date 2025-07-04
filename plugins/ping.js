const { Module } = require('../lib/Module');

Module({
    command: 'ping',
    package: 'mics',
    description: 'Check bot response time',
    aliases: ['p']
})(async (message) => {
    const start = Date.now();
    const ctx = await message.send('Ping...', 'text');
    const end = Date.now();
    const res = end - start;
    const ntx = `Pong! ${res}ms`;
    await message.send(ntx, 'text', { edit: ctx.key });
});
