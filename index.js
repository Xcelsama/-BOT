const fs = require('fs');
const config = require('./config');
const { startBot } = require('./lib/client');
const { SessionCode } = require('./lib/session');
const {connectMongoDB} = require('./lib/DB/database');

const Client = async () => {
    if (!fs.existsSync("./lib/multi_auth/creds.json")) 
    await SessionCode(config.SESSION_ID || process.env.SESSION_ID, "./lib/multi_auth");
    await connectMongoDB();
    await startBot();
}

Client();
