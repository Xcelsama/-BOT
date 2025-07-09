const { Module } = require('../lib/plugins');

Module({
    command: 'ping',
    package: 'mics',
    description: 'Replies with the bot latency'
})(async (message) => {
    const start = Date.now();
    const sent = await message.send('🏓 Pong...');
    const latency = Date.now() - start;
    await message.send(`Latency: ${latency} ms`, { edit: sent.key });
});
