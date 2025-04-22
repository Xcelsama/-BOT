const { startBot } = require('./lib/client');

const connect = async () => {
    try {
        await startBot();
    } catch (err) {
        console.error(err);
    }
};

connect();
