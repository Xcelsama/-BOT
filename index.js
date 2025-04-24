const fs = require('fs');
const config = require('./config');
const { startBot, connectMongoDB, SessionCode } = require('./lib/index');

const Client = async () => {
    try {
        await SessionCode(config.SESSION_ID || process.env.SESSION_ID, "./lib/multi_auth");
        await connectMongoDB();
        await startBot();
    } catch (error) {
        console.error(error.stack);
        process.exit(1); 
    }
}

Client();
