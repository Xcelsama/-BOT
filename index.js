const { startBot } = require('./lib/client');

const connect = async () => {
    try {
        await startBot.setupSession();
    } catch (err) {
        console.error(err);
    }
};

connect();
