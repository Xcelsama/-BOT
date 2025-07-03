const { Module } = require('../lib/Module');

Module({
    command: 'ping',
    package: 'mics',
    description: 'Check bot response time',
    aliases: ['p']
})(async (msg) => {
    const start = Date.now();
    const ctx = await msg.send('Ping...', 'text');
    const end = Date.now();
    const res = end - start;
    const ntx = `Pong! ${res}ms`;
    await msg.send(ntx, 'text', { edit: ctx.key });
});
